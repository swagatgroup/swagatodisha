const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/contact-documents';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, TXT files are allowed.'));
        }
    }
});

// @desc    Submit contact form with optional document uploads
// @route   POST /api/contact/submit
// @access  Public
router.post('/submit', [
    upload.array('documents', 5), // Maximum 5 files
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 digits'),
    body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Clean up uploaded files if validation fails
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    try {
                        await fs.unlink(file.path);
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
        let transporter = null;
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
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
            subject: `Contact Form: ${subject}`,
            html: emailContent,
            attachments: documents.map(file => ({
                filename: file.originalname,
                path: file.path
            }))
        };

        // Send email (if transporter is configured)
        if (transporter) {
            try {
                await transporter.sendMail(mailOptions);
                console.log('Contact form email sent successfully');

                // Send confirmation email to user
                const userMailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
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
                console.log('Confirmation email sent successfully');
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't fail the request if email fails
            }
        } else {
            // Log the contact form submission if email is not configured
            console.log('Contact Form Submission (Email not configured):', {
                name, email, phone, subject, message,
                documentsCount: documents.length,
                timestamp: new Date().toISOString()
            });
        }

        // Clean up uploaded files after successful email sending
        for (const file of documents) {
            try {
                await fs.unlink(file.path);
            } catch (err) {
                console.error('Error cleaning up file:', err);
            }
        }

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

    } catch (error) {
        console.error('Contact form error:', error);

        // Clean up uploaded files on error
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    await fs.unlink(file.path);
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

module.exports = router;
