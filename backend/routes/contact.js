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
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        if (hasCustomSMTP) {
            const portNum = parseInt(process.env.SMTP_PORT, 10) || 587;
            const isSecure = portNum === 465;
            return nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: portNum,
                secure: isSecure,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        }
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
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
            console.warn('Email configuration not found. Contact form will be logged but not emailed.');
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
            try {
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
                const adminResult = await sendEmail('contactFormAdmin', emailData);
                if (adminResult.success) {
                    console.log('✅ Contact form admin email sent via SendGrid');
                } else {
                    console.error('❌ SendGrid admin email failed, falling back to SMTP');
                    // Fallback to SMTP if SendGrid fails
                    if (transporter) {
                        try {
                            await transporter.sendMail(mailOptions);
                            console.log('✅ Contact form admin email sent via SMTP fallback');
                        } catch (smtpError) {
                            console.error('❌ SMTP fallback also failed:', smtpError);
                        }
                    }
                }

                // Send user confirmation email
                const userResult = await sendEmail('contactFormUser', emailData);
                if (userResult.success) {
                    console.log('✅ Contact form user confirmation sent via SendGrid');
                } else {
                    console.error('❌ SendGrid user email failed, falling back to SMTP');
                    // Fallback to SMTP if SendGrid fails
                    if (transporter) {
                        try {
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
                            await transporter.sendMail(userMailOptions);
                            console.log('✅ Contact form user confirmation sent via SMTP fallback');
                        } catch (smtpError) {
                            console.error('❌ SMTP user email fallback also failed:', smtpError);
                        }
                    }
                }
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
