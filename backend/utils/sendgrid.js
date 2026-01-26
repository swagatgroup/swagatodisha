const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set SendGrid API key with validation
if (process.env.SENDGRID_API_KEY) {
    // Remove any whitespace or newlines from the API key
    const apiKey = process.env.SENDGRID_API_KEY.trim();
    if (apiKey && apiKey.length > 0) {
        sgMail.setApiKey(apiKey);
        console.log('✅ SendGrid API key configured (length: ' + apiKey.length + ')');
    } else {
        console.warn('⚠️ SendGrid API key is empty');
    }
} else {
    console.warn('⚠️ SendGrid API key not found in environment variables');
}

// Email templates
const emailTemplates = {
    // Contact form submission to admin
    contactFormAdmin: (data) => ({
        to: process.env.CONTACT_EMAIL || process.env.FROM_EMAIL,
        from: process.env.FROM_EMAIL,
        replyTo: data.email,
        subject: `Contact Form: ${data.subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    New Contact Form Submission
                </h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Phone:</strong> ${data.phone}</p>
                    <p><strong>Subject:</strong> ${data.subject}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: white; padding: 15px; border-radius: 3px; border-left: 4px solid #007bff;">
                        ${data.message.replace(/\n/g, '<br>')}
                    </p>
                </div>
                ${data.documents && data.documents.length > 0 ? `
                    <div style="margin: 20px 0;">
                        <h3>Attached Documents:</h3>
                        <ul>
                            ${data.documents.map(doc => `<li>${doc.originalname} (${(doc.size / 1024).toFixed(2)} KB)</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This email was sent from the Swagat Odisha contact form.
                </p>
            </div>
        `
    }),

    // Confirmation email to user
    contactFormUser: (data) => ({
        to: data.email,
        from: process.env.FROM_EMAIL,
        subject: 'Thank you for contacting Swagat Odisha',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #007bff; margin: 0;">Swagat Odisha</h1>
                    <p style="color: #666; margin: 5px 0;">Educational Management System</p>
                </div>
                
                <h2 style="color: #333;">Thank you for contacting us!</h2>
                
                <p>Dear ${data.name},</p>
                
                <p>We have received your message and will get back to you within 24 hours.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">Your Message:</h3>
                    <p style="background: white; padding: 15px; border-radius: 3px; border-left: 4px solid #28a745;">
                        ${data.message.replace(/\n/g, '<br>')}
                    </p>
                </div>
                
                <p>If you have any urgent queries, please call us at our office.</p>
                
                <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="margin-top: 0;">Contact Information:</h4>
                    <p><strong>Email:</strong> ${process.env.CONTACT_EMAIL || process.env.FROM_EMAIL}</p>
                    <p><strong>Website:</strong> https://swagatodisha.com</p>
                </div>
                
                <p>Best regards,<br><strong>Swagat Odisha Team</strong></p>
                
                <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">
                    This is an automated response. Please do not reply to this email.
                </p>
            </div>
        `
    }),

    // Student application notification
    studentApplication: (data) => ({
        to: process.env.CONTACT_EMAIL || process.env.FROM_EMAIL,
        from: process.env.FROM_EMAIL,
        replyTo: data.email,
        subject: `New Student Application: ${data.fullName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
                    New Student Application
                </h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Student Name:</strong> ${data.fullName}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Phone:</strong> ${data.phone}</p>
                    <p><strong>Course:</strong> ${data.course}</p>
                    <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Please review this application in the admin dashboard.
                </p>
            </div>
        `
    }),

    // Password reset email
    passwordReset: (data) => ({
        to: data.email,
        from: process.env.FROM_EMAIL,
        subject: 'Password Reset - Swagat Odisha',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #007bff; margin: 0;">Swagat Odisha</h1>
                    <p style="color: #666; margin: 5px 0;">Educational Management System</p>
                </div>
                
                <h2 style="color: #333;">Password Reset Request</h2>
                
                <p>Dear ${data.name},</p>
                
                <p>You have requested to reset your password. Click the button below to reset your password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.resetUrl}" 
                       style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #007bff;">${data.resetUrl}</p>
                
                <p><strong>This link will expire in 1 hour.</strong></p>
                
                <p>If you didn't request this password reset, please ignore this email.</p>
                
                <p>Best regards,<br><strong>Swagat Odisha Team</strong></p>
                
                <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">
                    This is an automated response. Please do not reply to this email.
                </p>
            </div>
        `
    })
};

// Send email function
const sendEmail = async (templateName, data) => {
    try {
        const apiKey = process.env.SENDGRID_API_KEY?.trim();
        if (!apiKey || apiKey.length === 0) {
            throw new Error('SendGrid API key not configured (SENDGRID_API_KEY missing or empty)');
        }

        // Validate API key format (SendGrid API keys start with 'SG.')
        if (!apiKey.startsWith('SG.')) {
            console.warn('⚠️ SendGrid API key does not start with "SG." - may be invalid');
        }

        if (!process.env.FROM_EMAIL) {
            throw new Error('FROM_EMAIL environment variable not configured');
        }

        const template = emailTemplates[templateName];
        if (!template) {
            throw new Error(`Email template '${templateName}' not found`);
        }

        const emailData = template(data);

        // Validate email data
        if (!emailData.to) {
            throw new Error(`Email template '${templateName}' missing 'to' field`);
        }
        if (!emailData.from) {
            throw new Error(`Email template '${templateName}' missing 'from' field (FROM_EMAIL not set)`);
        }

        // Add EU Data Residency if needed
        if (process.env.SENDGRID_EU_DATA_RESIDENCY === 'true') {
            emailData.setDataResidency = true;
        }

        const result = await sgMail.send(emailData);

        console.log(`✅ Email sent successfully: ${templateName}`, {
            to: emailData.to,
            from: emailData.from,
            subject: emailData.subject
        });
        return {
            success: true,
            messageId: result[0].headers['x-message-id'],
            template: templateName
        };
    } catch (error) {
        // Enhanced error logging for 401 Unauthorized
        if (error.response?.statusCode === 401 || error.code === 401) {
            const errorDetails = error.response?.body || {};
            console.error(`❌ SendGrid Authentication Failed (${templateName}):`, {
                message: error.message,
                statusCode: error.response?.statusCode || error.code,
                errors: errorDetails.errors || errorDetails,
                hint: 'Check if SENDGRID_API_KEY is valid and not expired. Verify the API key in SendGrid dashboard.'
            });
        } else {
            console.error(`❌ Email sending failed (${templateName}):`, {
                message: error.message,
                response: error.response?.body || error.response,
                code: error.code,
                statusCode: error.response?.statusCode
            });
        }
        return {
            success: false,
            error: error.message,
            details: error.response?.body || error.response,
            statusCode: error.response?.statusCode || error.code,
            template: templateName
        };
    }
};

// Test email function
const testEmail = async () => {
    try {
        const testData = {
            name: 'Test User',
            email: process.env.CONTACT_EMAIL || process.env.FROM_EMAIL,
            subject: 'Test Email',
            message: 'This is a test email from Swagat Odisha backend.',
            phone: '1234567890'
        };

        const result = await sendEmail('contactFormAdmin', testData);
        return result;
    } catch (error) {
        console.error('Test email failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Batch email function
const sendBatchEmails = async (emails) => {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured');
        }

        const result = await sgMail.send(emails);

        console.log(`✅ Batch email sent successfully: ${emails.length} emails`);
        return {
            success: true,
            messageIds: result.map(r => r.headers['x-message-id']),
            count: emails.length
        };
    } catch (error) {
        console.error('❌ Batch email sending failed:', error.message);
        return {
            success: false,
            error: error.message,
            count: emails.length
        };
    }
};

module.exports = {
    sendEmail,
    testEmail,
    sendBatchEmails,
    emailTemplates
};
