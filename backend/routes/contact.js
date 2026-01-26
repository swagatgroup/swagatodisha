const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { sendEmail } = require('../utils/sendgrid');
const { contactFormRateLimit, checkHoneypot, antiSpamMiddleware } = require('../middleware/antiSpam');
const router = express.Router();

// Helper: build a robust SMTP transporter from env
const buildTransporter = () => {
    const hasCustomSMTP = process.env.SMTP_HOST && process.env.SMTP_PORT;
    
    // Clean email password - remove all spaces (Gmail app passwords are displayed with spaces but used without)
    let emailPass = process.env.EMAIL_PASS;
    if (emailPass) {
        const originalLength = emailPass.length;
        emailPass = emailPass.replace(/\s+/g, ''); // Remove all spaces
        if (originalLength !== emailPass.length) {
            console.warn('⚠️ EMAIL_PASS contained spaces - automatically removed. Original length:', originalLength, 'Cleaned length:', emailPass.length);
        }
    }
    
    if (process.env.EMAIL_USER && emailPass) {
        // If custom SMTP is configured, use it (works with Mailgun, Sendinblue, AWS SES, etc.)
        if (hasCustomSMTP) {
            const portNum = parseInt(process.env.SMTP_PORT, 10) || 587;
            const isSecure = portNum === 465;
            
            // For production, use explicit TLS settings
            const transporterConfig = {
                host: process.env.SMTP_HOST,
                port: portNum,
                secure: isSecure, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: emailPass // Use cleaned password
                },
                // Increased timeouts for cloud environments
                connectionTimeout: 30000, // 30 seconds
                greetingTimeout: 30000,
                socketTimeout: 30000,
                // Retry configuration
                pool: false, // Disable pooling for cloud environments
                // TLS options for better compatibility
                tls: {
                    rejectUnauthorized: false, // Accept self-signed certificates if needed
                    ciphers: 'SSLv3'
                }
            };
            
            // For non-secure ports, require STARTTLS
            if (!isSecure && (portNum === 587 || portNum === 2525)) {
                transporterConfig.requireTLS = true;
            }
            
            // Special handling for common SMTP providers that work on cloud platforms
            const smtpHost = process.env.SMTP_HOST.toLowerCase();
            if (smtpHost.includes('mailgun')) {
                console.log('📧 Using Mailgun SMTP (cloud-friendly)');
            } else if (smtpHost.includes('brevo') || smtpHost.includes('sendinblue')) {
                console.log('📧 Using Sendinblue/Brevo SMTP (cloud-friendly)');
            } else if (smtpHost.includes('amazonaws') || smtpHost.includes('ses')) {
                console.log('📧 Using AWS SES SMTP (cloud-friendly)');
            } else if (smtpHost.includes('mailjet')) {
                console.log('📧 Using Mailjet SMTP (cloud-friendly)');
            } else if (smtpHost.includes('sparkpost')) {
                console.log('📧 Using SparkPost SMTP (cloud-friendly)');
            } else {
                console.log('📧 Using custom SMTP provider');
            }
            
            console.log('📧 Creating SMTP transporter with custom settings:', {
                host: process.env.SMTP_HOST,
                port: portNum,
                secure: isSecure,
                requireTLS: transporterConfig.requireTLS,
                user: process.env.EMAIL_USER
            });
            
            return nodemailer.createTransport(transporterConfig);
        }
        
        // Gmail configuration - use explicit settings instead of service: 'gmail'
        // This works better in cloud environments
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Gmail SMTP port configuration
        // Port 2525 is Gmail's alternative TLS port that may work on cloud platforms
        let smtpPort = 587; // Default to 587 for local
        let isSecure = false;
        
        if (process.env.SMTP_PORT) {
            // Explicit port set in environment
            smtpPort = parseInt(process.env.SMTP_PORT, 10);
            isSecure = smtpPort === 465;
        } else if (isProduction) {
            // Production: Try port 2525 first (Gmail alternative TLS port)
            // This port is sometimes not blocked on cloud platforms
            smtpPort = 2525;
            isSecure = false;
            console.log('📧 Production: Using Gmail port 2525 (alternative TLS - may work on cloud platforms)');
            console.log('💡 If this fails, explicitly set SMTP_PORT=465 or SMTP_PORT=587');
        }
        
        const gmailConfig = {
            host: 'smtp.gmail.com',
            port: smtpPort,
            secure: isSecure, // true for 465 (SSL), false for 587/2525 (TLS)
            requireTLS: !isSecure && (smtpPort === 587 || smtpPort === 2525), // Require TLS for ports 587 and 2525
            auth: {
                user: process.env.EMAIL_USER,
                pass: emailPass // Use cleaned password
            },
            // Increased timeouts for production
            connectionTimeout: isProduction ? 30000 : 10000,
            greetingTimeout: isProduction ? 30000 : 10000,
            socketTimeout: isProduction ? 30000 : 10000,
            // Disable pooling in production (causes issues on some cloud platforms)
            pool: false, // Always disable pooling in production
            maxConnections: 1,
            maxMessages: 3,
            // TLS/SSL options
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            }
        };
        
        const portType = smtpPort === 2525 ? 'Alternative TLS (may work on cloud platforms)' : 
                        smtpPort === 465 ? 'SSL' : 'TLS';
        
        console.log('📧 Creating Gmail SMTP transporter:', {
            host: gmailConfig.host,
            port: `${gmailConfig.port} (${portType})`,
            secure: gmailConfig.secure,
            requireTLS: gmailConfig.requireTLS,
            user: process.env.EMAIL_USER,
            isProduction
        });
        
        if (isProduction && smtpPort === 2525) {
            console.log('💡 Using Gmail port 2525 - alternative TLS port (may work on cloud platforms)');
            console.log('💡 If this fails, try explicitly setting SMTP_PORT=465 or SMTP_PORT=587');
        }
        
        return nodemailer.createTransport(gmailConfig);
    }
    return null;
};

// Import file security utilities
const { sanitizeFilename, validateFileSecurity } = require('../utils/fileSecurity');

// Configure multer for file uploads with enhanced security
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.CONTACT_UPLOAD_DIR || 'uploads/contact-documents';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename to prevent path traversal and XSS
        const sanitized = sanitizeFilename(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(sanitized);
        const name = path.basename(sanitized, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files
    },
    fileFilter: (req, file, cb) => {
        // Allowed MIME types
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'text/plain'
        ];

        // Allowed extensions
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();

        // Check extension
        if (!allowedExtensions.includes(ext)) {
            return cb(new Error(`File extension ${ext} is not allowed. Only PDF, DOC, DOCX, JPG, PNG, TXT files are allowed.`));
        }

        // Check MIME type
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error(`File type ${file.mimetype} is not allowed. Only PDF, DOC, DOCX, JPG, PNG, TXT files are allowed.`));
        }

        cb(null, true);
    }
});

// Middleware to validate uploaded files after multer processes them
const validateUploadedFiles = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(); // No files, continue
    }

    const validationErrors = [];
    const validatedFiles = [];

    for (const file of req.files) {
        try {
            // Comprehensive security validation
            const validation = await validateFileSecurity(
                file.path,
                file.originalname,
                file.mimetype
            );

            if (!validation.safe) {
                validationErrors.push({
                    filename: file.originalname,
                    errors: validation.errors
                });

                // Clean up unsafe file
                try {
                    await fsp.unlink(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting unsafe file:', unlinkError);
                }
            } else {
                validatedFiles.push(file);
            }
        } catch (error) {
            console.error('Error validating file:', error);
            validationErrors.push({
                filename: file.originalname,
                errors: ['File validation error: ' + error.message]
            });

            // Clean up file on error
            try {
                await fsp.unlink(file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
    }

    // If any files failed validation, reject the entire request
    if (validationErrors.length > 0) {
        // Clean up any remaining validated files
        for (const file of validatedFiles) {
            try {
                await fsp.unlink(file.path);
            } catch (error) {
                console.error('Error cleaning up file:', error);
            }
        }

        return res.status(400).json({
            success: false,
            message: 'File validation failed',
            errors: validationErrors
        });
    }

    // Replace req.files with validated files
    req.files = validatedFiles;
    next();
};

// @desc    Submit contact form with optional document uploads
// @route   POST /api/contact/submit
// @access  Public
router.post('/submit', [
    contactFormRateLimit, // Stricter rate limiting (3 per hour)
    upload.array('documents', 5), // Maximum 5 files - MUST come first to parse multipart form
    validateUploadedFiles, // Validate file security after upload - MUST come after multer
    checkHoneypot, // Check honeypot field (after multer parses body)
    antiSpamMiddleware, // Comprehensive anti-spam checks (after multer parses body)
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name must be 2-100 characters and contain only letters and spaces'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('phone')
        .customSanitizer((value) => (value || '').replace(/\D/g, ''))
        .isLength({ min: 10, max: 10 })
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Phone number must be exactly 10 digits starting with 6, 7, 8, or 9 (Indian mobile number)'),
    body('subject')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Subject must be 3-200 characters'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Message must be 10-5000 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Clean up uploaded files if validation fails
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    try {
                        await fsp.unlink(file.path);
                    } catch (err) {
                        console.error('Error cleaning up file:', err);
                    }
                }
            }

            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { name, email, phone, subject, message } = req.body;
        const documents = req.files || [];

        // Create email transporter (with fallback if email not configured)
        let transporter = buildTransporter();
        if (!transporter) {
            console.warn('⚠️ Email configuration not found. Contact form will be logged but not emailed.');
            console.warn('⚠️ Required: EMAIL_USER and EMAIL_PASS (or SMTP_HOST, SMTP_PORT)');
            console.warn('⚠️ Current values:', {
                hasEmailUser: !!process.env.EMAIL_USER,
                hasEmailPass: !!process.env.EMAIL_PASS,
                emailUserLength: process.env.EMAIL_USER?.length || 0,
                emailPassLength: process.env.EMAIL_PASS?.length || 0,
                emailUser: process.env.EMAIL_USER || 'NOT SET',
                // Don't log password, but log if it has spaces or looks wrong
                emailPassHasSpaces: process.env.EMAIL_PASS?.includes(' ') || false,
                emailPassStartsWithSpace: process.env.EMAIL_PASS?.startsWith(' ') || false,
                emailPassEndsWithSpace: process.env.EMAIL_PASS?.endsWith(' ') || false
            });
        } else {
            // Log SMTP configuration (without sensitive data)
            console.log('📧 SMTP transporter created successfully');
            if (process.env.SMTP_HOST) {
                console.log('📧 Using custom SMTP:', process.env.SMTP_HOST + ':' + process.env.SMTP_PORT);
            } else {
                console.log('📧 Using Gmail SMTP');
            }
            // Validate app password format (Gmail app passwords are 16 characters, no spaces)
            if (process.env.EMAIL_PASS) {
                const pass = process.env.EMAIL_PASS.trim();
                if (pass.includes(' ')) {
                    console.warn('⚠️ WARNING: EMAIL_PASS contains spaces! Gmail app passwords should have no spaces.');
                    console.warn('⚠️ Make sure to copy the 16-character password without any spaces.');
                }
                if (pass.length !== 16 && !process.env.SMTP_HOST) {
                    console.warn(`⚠️ WARNING: EMAIL_PASS length is ${pass.length}, expected 16 for Gmail app password.`);
                }
            }
        }

        // Prepare email content
        let emailContent = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `;

        if (documents.length > 0) {
            emailContent += `<p><strong>Attached Documents:</strong></p><ul>`;
            documents.forEach(doc => {
                emailContent += `<li>${doc.originalname} (${(doc.size / 1024).toFixed(2)} KB)</li>`;
            });
            emailContent += `</ul>`;
        }

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
            replyTo: email, // reply directly to the sender
            subject: `Contact Form: ${subject}`,
            html: emailContent,
            attachments: documents.map(file => ({
                filename: file.originalname,
                path: file.path
            }))
        };
        // Respond immediately for a fast UX
        res.status(200).json({
            success: true,
            message: 'Contact form submitted successfully. We will get back to you soon!',
            data: {
                name,
                email,
                subject,
                documentsCount: documents.length
            }
        });

        // Background job: send emails using SendGrid and then cleanup files
        setImmediate(async () => {
            let adminEmailSent = false;
            let userEmailSent = false;
            
            try {
                // Check email configuration
                const hasSendGrid = !!process.env.SENDGRID_API_KEY;
                const hasFromEmail = !!process.env.FROM_EMAIL;
                const hasSMTP = !!transporter;
                
                console.log('📧 Email Configuration Check:', {
                    hasSendGrid,
                    hasFromEmail,
                    hasSMTP,
                    fromEmail: process.env.FROM_EMAIL || 'NOT SET',
                    contactEmail: process.env.CONTACT_EMAIL || 'NOT SET',
                    emailUser: process.env.EMAIL_USER || 'NOT SET'
                });

                // Prepare data for SendGrid templates
                const emailData = {
                    name,
                    email,
                    phone,
                    subject,
                    message,
                    documents: documents.map(file => ({
                        originalname: file.originalname,
                        size: file.size
                    }))
                };

                // Send admin notification email
                if (hasSendGrid && hasFromEmail) {
                    const adminResult = await sendEmail('contactFormAdmin', emailData);
                    if (adminResult.success) {
                        console.log('✅ Contact form admin email sent via SendGrid');
                        adminEmailSent = true;
                    } else {
                        console.error('❌ SendGrid admin email failed:', adminResult.error);
                    }
                } else {
                    console.warn('⚠️ SendGrid not configured (missing SENDGRID_API_KEY or FROM_EMAIL)');
                }

                // Fallback to SMTP for admin email if SendGrid failed
                if (!adminEmailSent && transporter) {
                    // Retry logic for SMTP (up to 3 attempts)
                    let smtpAttempts = 0;
                    const maxSmtpAttempts = 3;
                    let smtpSuccess = false;
                    
                    while (smtpAttempts < maxSmtpAttempts && !smtpSuccess) {
                        try {
                            smtpAttempts++;
                            console.log(`📧 SMTP attempt ${smtpAttempts}/${maxSmtpAttempts} for admin email...`);
                            
                            // Verify connection before sending (only on first attempt)
                            if (smtpAttempts === 1) {
                                try {
                                    await transporter.verify();
                                    console.log('✅ SMTP connection verified');
                                } catch (verifyError) {
                                    console.error('❌ SMTP verification failed:', {
                                        message: verifyError.message,
                                        code: verifyError.code,
                                        command: verifyError.command,
                                        response: verifyError.response,
                                        responseCode: verifyError.responseCode
                                    });
                                    
                                    // Common Gmail authentication errors
                                    if (verifyError.responseCode === 535 || verifyError.message.includes('Invalid login')) {
                                        console.error('❌ AUTHENTICATION FAILED - Check your EMAIL_PASS (App Password)');
                                        console.error('❌ Make sure:');
                                        console.error('   1. You are using a Gmail App Password (16 characters, no spaces)');
                                        console.error('   2. The password is copied correctly without extra spaces');
                                        console.error('   3. 2-Step Verification is enabled on your Google account');
                                        console.error('   4. The app password was created for "Mail"');
                                        break; // Don't retry auth errors
                                    }
                                    
                                    // Continue to try sending anyway
                                }
                            }
                            
                            await transporter.sendMail(mailOptions);
                            console.log('✅ Contact form admin email sent via SMTP fallback');
                            adminEmailSent = true;
                            smtpSuccess = true;
                        } catch (smtpError) {
                            console.error(`❌ SMTP attempt ${smtpAttempts} failed:`, {
                                message: smtpError.message,
                                code: smtpError.code,
                                command: smtpError.command,
                                response: smtpError.response,
                                responseCode: smtpError.responseCode
                            });
                            
                            // Check for authentication errors
                            if (smtpError.responseCode === 535 || smtpError.message.includes('Invalid login') || smtpError.message.includes('authentication')) {
                                console.error('❌ AUTHENTICATION ERROR - Invalid credentials');
                                console.error('❌ Check your EMAIL_USER and EMAIL_PASS in production environment variables');
                                console.error('❌ For Gmail, make sure you are using an App Password, not your regular password');
                                break; // Don't retry auth errors
                            }
                            
                            // If it's a connection timeout and we have retries left, wait and retry
                            if (smtpError.code === 'ETIMEDOUT' || smtpError.code === 'ECONNRESET') {
                                if (smtpAttempts < maxSmtpAttempts) {
                                    console.log(`⏳ Waiting 2 seconds before retry...`);
                                    await new Promise(resolve => setTimeout(resolve, 2000));
                                }
                            } else {
                                // For other errors, don't retry
                                break;
                            }
                        }
                    }
                    
                    if (!smtpSuccess) {
                        console.error('❌ All SMTP attempts failed for admin email');
                    }
                } else if (!adminEmailSent && !transporter) {
                    console.error('❌ No email method available - SMTP not configured');
                }

                // Send user confirmation email
                if (hasSendGrid && hasFromEmail) {
                    const userResult = await sendEmail('contactFormUser', emailData);
                    if (userResult.success) {
                        console.log('✅ Contact form user confirmation sent via SendGrid');
                        userEmailSent = true;
                    } else {
                        console.error('❌ SendGrid user email failed:', userResult.error);
                    }
                }

                // Fallback to SMTP for user email if SendGrid failed
                if (!userEmailSent && transporter) {
                    // Retry logic for SMTP (up to 3 attempts)
                    let smtpAttempts = 0;
                    const maxSmtpAttempts = 3;
                    let smtpSuccess = false;
                    
                    const userMailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        replyTo: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
                        subject: 'Thank you for contacting Swagat Odisha',
                        html: `
                            <h2>Thank you for contacting us!</h2>
                            <p>Dear ${name},</p>
                            <p>We have received your message and will get back to you within 24 hours.</p>
                            <p><strong>Your message:</strong></p>
                            <p>${message.replace(/\n/g, '<br>')}</p>
                            <p>Best regards,<br>Swagat Odisha Team</p>
                        `
                    };
                    
                    while (smtpAttempts < maxSmtpAttempts && !smtpSuccess) {
                        try {
                            smtpAttempts++;
                            console.log(`📧 SMTP attempt ${smtpAttempts}/${maxSmtpAttempts} for user confirmation email...`);
                            
                            await transporter.sendMail(userMailOptions);
                            console.log('✅ Contact form user confirmation sent via SMTP fallback');
                            userEmailSent = true;
                            smtpSuccess = true;
                        } catch (smtpError) {
                            console.error(`❌ SMTP attempt ${smtpAttempts} failed for user email:`, {
                                message: smtpError.message,
                                code: smtpError.code,
                                command: smtpError.command,
                                response: smtpError.response,
                                responseCode: smtpError.responseCode
                            });
                            
                            // If it's a connection timeout and we have retries left, wait and retry
                            if (smtpError.code === 'ETIMEDOUT' || smtpError.code === 'ECONNRESET') {
                                if (smtpAttempts < maxSmtpAttempts) {
                                    console.log(`⏳ Waiting 2 seconds before retry...`);
                                    await new Promise(resolve => setTimeout(resolve, 2000));
                                }
                            } else {
                                // For other errors, don't retry
                                break;
                            }
                        }
                    }
                    
                    if (!smtpSuccess) {
                        console.error('❌ All SMTP attempts failed for user confirmation email');
                    }
                } else if (!userEmailSent && !transporter) {
                    console.error('❌ No email method available for user confirmation - SMTP not configured');
                }

                // Final summary
                console.log('📧 Email Sending Summary:', {
                    adminEmailSent,
                    userEmailSent,
                    recipientEmail: email
                });

            } catch (error) {
                console.error('❌ Unexpected error in email sending background job:', {
                    message: error.message,
                    stack: error.stack
                });
            } finally {
                // Always cleanup files
                for (const file of documents) {
                    try {
                        await fsp.unlink(file.path);
                    } catch (err) {
                        console.error('Error cleaning up file (background):', err);
                    }
                }
            }
        });

    } catch (error) {
        console.error('Contact form error:', error);

        // Clean up uploaded files on error
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    await fsp.unlink(file.path);
                } catch (err) {
                    console.error('Error cleaning up file:', err);
                }
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to submit contact form. Please try again later.'
        });
    }
});

// Test SendGrid configuration endpoint
// @route   GET /api/contact/test-sendgrid
// @access  Public (for debugging)
router.get('/test-sendgrid', async (req, res) => {
    try {
        const hasSendGrid = !!process.env.SENDGRID_API_KEY;
        const hasFromEmail = !!process.env.FROM_EMAIL;
        
        if (!hasSendGrid) {
            return res.status(400).json({
                success: false,
                message: 'SendGrid not configured',
                details: {
                    hasSendGrid: false,
                    hasFromEmail,
                    hint: 'Set SENDGRID_API_KEY in production environment variables'
                }
            });
        }
        
        if (!hasFromEmail) {
            return res.status(400).json({
                success: false,
                message: 'FROM_EMAIL not configured',
                details: {
                    hasSendGrid: true,
                    hasFromEmail: false,
                    hint: 'Set FROM_EMAIL in production environment variables (must be verified in SendGrid)'
                }
            });
        }
        
        // Test SendGrid
        const { testEmail } = require('../utils/sendgrid');
        const result = await testEmail();
        
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'SendGrid is working correctly',
                details: {
                    messageId: result.messageId,
                    fromEmail: process.env.FROM_EMAIL,
                    contactEmail: process.env.CONTACT_EMAIL || process.env.FROM_EMAIL
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'SendGrid test failed',
                error: result.error,
                details: result.details,
                troubleshooting: {
                    'If statusCode is 401': 'Invalid SENDGRID_API_KEY - check if it\'s correct and active',
                    'If FROM_EMAIL error': 'FROM_EMAIL must be verified in SendGrid dashboard',
                    'How to fix': '1. Go to SendGrid dashboard 2. Verify sender email 3. Create/verify API key 4. Set both in production environment'
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error testing SendGrid',
            error: error.message
        });
    }
});

// Test SMTP connection endpoint
// @route   GET /api/contact/test-smtp
// @access  Public (for debugging)
router.get('/test-smtp', async (req, res) => {
    try {
        const transporter = buildTransporter();
        if (!transporter) {
            return res.status(400).json({
                success: false,
                message: 'SMTP not configured',
                details: {
                    hasEmailUser: !!process.env.EMAIL_USER,
                    hasEmailPass: !!process.env.EMAIL_PASS,
                    emailUser: process.env.EMAIL_USER || 'NOT SET',
                    emailPassLength: process.env.EMAIL_PASS?.length || 0,
                    emailPassHasSpaces: process.env.EMAIL_PASS?.includes(' ') || false
                }
            });
        }

        // Test connection
        try {
            await transporter.verify();
            return res.status(200).json({
                success: true,
                message: 'SMTP connection successful',
                details: {
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: process.env.SMTP_PORT || '587',
                    user: process.env.EMAIL_USER,
                    passLength: process.env.EMAIL_PASS?.length || 0
                }
            });
        } catch (verifyError) {
            return res.status(400).json({
                success: false,
                message: 'SMTP connection failed',
                error: {
                    message: verifyError.message,
                    code: verifyError.code,
                    responseCode: verifyError.responseCode,
                    command: verifyError.command
                },
                troubleshooting: {
                    'If responseCode is 535': 'Invalid credentials - check EMAIL_PASS (App Password)',
                    'If code is ETIMEDOUT': 'Port 587 is blocked. Code now uses port 465 (SSL) in production. If still failing, check firewall/network restrictions.',
                    'If message includes "Invalid login"': 'Use Gmail App Password, not regular password',
                    'Cloud Platform Note': 'Many cloud platforms (Render, Vercel) block port 587. The code now automatically uses port 465 in production.'
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error testing SMTP',
            error: error.message
        });
    }
});

// Test email endpoint to validate SendGrid configuration
// @route   POST /api/contact/test-email
// @access  Private (guarded by a simple token if provided)
router.post('/test-email', async (req, res) => {
    try {
        // Optional lightweight guard
        const provided = req.body && req.body.token;
        const expected = process.env.CONTACT_TEST_TOKEN;
        if (expected && provided !== expected) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        // Test SendGrid first
        const { testEmail } = require('../utils/sendgrid');
        const sendGridResult = await testEmail();

        if (sendGridResult.success) {
            return res.status(200).json({
                success: true,
                message: 'SendGrid test email sent successfully',
                provider: 'SendGrid',
                messageId: sendGridResult.messageId
            });
        }

        // Fallback to SMTP if SendGrid fails
        console.log('SendGrid failed, trying SMTP fallback...');
        const transporter = buildTransporter();
        if (!transporter) {
            return res.status(400).json({
                success: false,
                message: 'Both SendGrid and SMTP not configured',
                sendGridError: sendGridResult.error
            });
        }

        const to = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
        if (!to) {
            return res.status(400).json({ success: false, message: 'CONTACT_EMAIL or EMAIL_USER not set' });
        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Test Email: Swagat Odisha Contact (SMTP Fallback)',
            html: `<p>This is a test email from the Swagat Odisha backend at ${new Date().toISOString()}.</p>`
        });

        return res.status(200).json({
            success: true,
            message: 'Test email sent via SMTP fallback',
            provider: 'SMTP',
            sendGridError: sendGridResult.error
        });
    } catch (err) {
        console.error('Test email failed:', err);
        return res.status(500).json({ success: false, message: 'Test email failed', error: err.message });
    }
});

module.exports = router;
