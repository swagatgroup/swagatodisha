const formData = require('form-data');
const Mailgun = require('mailgun.js');
require('dotenv').config();

/**
 * Mailgun HTTP API Integration
 * 
 * This uses Mailgun's HTTP REST API (not SMTP) to send emails.
 * The mailgun.js library makes HTTP requests to Mailgun's API endpoints.
 * 
 * API Endpoint: https://api.mailgun.net/v3/{domain}/messages
 * Method: POST (HTTP)
 */

// Initialize Mailgun HTTP API client
let mailgunClient = null;
let mailgun = null;

if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    try {
        // Initialize Mailgun client for HTTP API (not SMTP)
        mailgunClient = new Mailgun(formData);
        mailgun = mailgunClient.client({
            username: 'api', // API username for HTTP authentication
            key: process.env.MAILGUN_API_KEY.trim() // API key for HTTP authentication
        });
        console.log('✅ Mailgun HTTP API configured successfully');
    } catch (error) {
        console.error('❌ Mailgun HTTP API initialization failed:', error.message);
    }
} else {
    console.warn('⚠️ Mailgun HTTP API not configured - MAILGUN_API_KEY and MAILGUN_DOMAIN required');
}

// Email templates
const emailTemplates = {
    // Contact form submission to admin
    contactFormAdmin: (data) => ({
        from: process.env.MAILGUN_FROM_EMAIL || `noreply@${process.env.MAILGUN_DOMAIN}`,
        to: process.env.CONTACT_EMAIL || process.env.MAILGUN_FROM_EMAIL,
        'h:Reply-To': data.email,
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
        `,
        text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Subject: ${data.subject}

Message:
${data.message}

${data.documents && data.documents.length > 0 ? `\nAttached Documents:\n${data.documents.map(doc => `- ${doc.originalname} (${(doc.size / 1024).toFixed(2)} KB)`).join('\n')}` : ''}
        `
    }),

    // Confirmation email to user
    contactFormUser: (data) => ({
        from: process.env.MAILGUN_FROM_EMAIL || `noreply@${process.env.MAILGUN_DOMAIN}`,
        to: data.email,
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
                    <p><strong>Email:</strong> ${process.env.CONTACT_EMAIL || process.env.MAILGUN_FROM_EMAIL}</p>
                    <p><strong>Website:</strong> https://swagatodisha.com</p>
                </div>
                
                <p>Best regards,<br><strong>Swagat Odisha Team</strong></p>
                
                <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">
                    This is an automated response. Please do not reply to this email.
                </p>
            </div>
        `,
        text: `
Thank you for contacting Swagat Odisha!

Dear ${data.name},

We have received your message and will get back to you within 24 hours.

Your Message:
${data.message}

If you have any urgent queries, please call us at our office.

Contact Information:
Email: ${process.env.CONTACT_EMAIL || process.env.MAILGUN_FROM_EMAIL}
Website: https://swagatodisha.com

Best regards,
Swagat Odisha Team
        `
    })
};

// Send email function using Mailgun
const sendEmail = async (templateName, data, attachments = []) => {
    try {
        if (!mailgun) {
            throw new Error('Mailgun not configured (MAILGUN_API_KEY and MAILGUN_DOMAIN required)');
        }

        if (!process.env.MAILGUN_DOMAIN) {
            throw new Error('MAILGUN_DOMAIN environment variable not configured');
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
            throw new Error(`Email template '${templateName}' missing 'from' field`);
        }

        // Prepare message data for Mailgun
        const messageData = {
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text
        };

        // Add reply-to if present
        if (emailData['h:Reply-To']) {
            messageData['h:Reply-To'] = emailData['h:Reply-To'];
        }

        // Add attachments if provided
        if (attachments && attachments.length > 0) {
            const fs = require('fs');
            messageData.attachment = attachments
                .filter(att => att && (att.path || att.buffer))
                .map(att => {
                    if (att.path && fs.existsSync(att.path)) {
                        return fs.createReadStream(att.path);
                    } else if (att.buffer) {
                        return {
                            data: att.buffer,
                            filename: att.filename || att.originalname || 'attachment'
                        };
                    }
                    return null;
                })
                .filter(att => att !== null);
        }

        // Send email via Mailgun HTTP API (POST request to api.mailgun.net)
        // This uses HTTP REST API, not SMTP
        const result = await mailgun.messages.create(process.env.MAILGUN_DOMAIN, messageData);

        console.log(`✅ Email sent successfully via Mailgun HTTP API: ${templateName}`, {
            to: emailData.to,
            from: emailData.from,
            subject: emailData.subject,
            messageId: result.id,
            method: 'HTTP API'
        });

        return {
            success: true,
            messageId: result.id,
            template: templateName
        };
    } catch (error) {
        console.error(`❌ Mailgun HTTP API email sending failed (${templateName}):`, {
            message: error.message,
            statusCode: error.status,
            details: error.details || error,
            method: 'HTTP API'
        });

        return {
            success: false,
            error: error.message,
            details: error.details || error,
            statusCode: error.status,
            template: templateName
        };
    }
};

// Test email function
const testEmail = async () => {
    try {
        if (!mailgun) {
            return {
                success: false,
                error: 'Mailgun not configured'
            };
        }

        const testEmailAddress = process.env.CONTACT_EMAIL || process.env.MAILGUN_FROM_EMAIL;
        if (!testEmailAddress) {
            return {
                success: false,
                error: 'CONTACT_EMAIL or MAILGUN_FROM_EMAIL not set'
            };
        }

        const result = await sendEmail('contactFormUser', {
            name: 'Test User',
            email: testEmailAddress,
            phone: '1234567890',
            subject: 'Test Email',
            message: 'This is a test email from Mailgun integration.'
        });

        return result;
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    sendEmail,
    testEmail,
    mailgun
};

