const { Resend } = require('resend');
require('dotenv').config();

/**
 * Resend Email Service Integration
 * 
 * Free Tier: 3,000 emails/month
 * No subscription needed
 * Very easy setup - just API key
 * No domain verification needed for testing
 * 
 * API: https://resend.com
 */

// Initialize Resend client
let resend = null;

if (process.env.RESEND_API_KEY) {
    try {
        resend = new Resend(process.env.RESEND_API_KEY.trim());
        console.log('✅ Resend email service configured successfully');
    } catch (error) {
        console.error('❌ Resend initialization failed:', error.message);
    }
} else {
    console.warn('⚠️ Resend not configured - RESEND_API_KEY required');
}

// Email templates
const emailTemplates = {
    // Contact form submission to admin
    contactFormAdmin: (data) => ({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL,
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
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
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
                    <h3 style="margin-top: 0; color: #333;">Your Submission Details:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;"><strong>Subject:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${data.subject || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;"><strong>Phone:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${data.phone || 'N/A'}</td>
                        </tr>
                        ${data.documents && data.documents.length > 0 ? `
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;"><strong>Documents:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                                ${data.documents.map(doc => `${doc.originalname} (${(doc.size / 1024).toFixed(2)} KB)`).join('<br>')}
                            </td>
                        </tr>
                        ` : ''}
                    </table>
                    <div style="margin-top: 15px;">
                        <h4 style="margin-top: 0; color: #333;">Your Message:</h4>
                        <p style="background: white; padding: 15px; border-radius: 3px; border-left: 4px solid #28a745;">
                            ${data.message.replace(/\n/g, '<br>')}
                        </p>
                    </div>
                </div>
                
                <p>If you have any urgent queries, please call us at our office.</p>
                
                <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="margin-top: 0;">Contact Information:</h4>
                    <p><strong>Email:</strong> ${process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL}</p>
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

    // Welcome / account created email
    welcomeEmail: (data) => ({
        from: `Swagat Odisha <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: data.email,
        subject: '🎉 Welcome to Swagat Odisha – Account Created Successfully',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Swagat Odisha</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f6fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a56db 0%,#0e9f6e 100%);padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">Swagat Odisha</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:1px;text-transform:uppercase;">Educational Management System</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:40px 40px 0;">
              <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:600;">🎉 Congratulations, ${data.fullName}!</h2>
              <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
                Your account has been successfully created at <strong>Swagat Odisha</strong>.
                We're thrilled to have you on board! Here are your account details:
              </p>
            </td>
          </tr>

          <!-- Account Details Card -->
          <tr>
            <td style="padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Full Name</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:500;">${data.fullName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Email Address</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#1a56db;font-weight:500;">${data.email}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Phone Number</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:500;">${data.phoneNumber || 'Not provided'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Password</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:500;font-family:monospace;letter-spacing:1px;background:#fff3cd;padding:6px 10px;border-radius:6px;display:inline-block;">${data.password}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Account Type</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:500;text-transform:capitalize;">${data.role || 'Student'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">⚠️ Security Tip</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#92400e;">
                      Please save your credentials safely and avoid sharing them with anyone. We recommend changing your password after your first login.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="${process.env.FRONTEND_URL || 'https://swagatodisha.com'}/login"
                 style="display:inline-block;background:linear-gradient(135deg,#1a56db 0%,#0e9f6e 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
                Login to Your Account →
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:14px;color:#374151;font-weight:600;">Swagat Odisha Team</p>
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                📧 ${process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || 'info@swagatodisha.com'} &nbsp;|&nbsp;
                🌐 swagatodisha.com
              </p>
              <p style="margin:16px 0 0;font-size:11px;color:#d1d5db;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    })
};

// Send email function using Resend
const sendEmail = async (templateName, data, attachments = []) => {
    try {
        if (!resend) {
            throw new Error('Resend not configured (RESEND_API_KEY required)');
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

        // Prepare message data for Resend
        const messageData = {
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html
        };

        // Add reply-to if present
        if (emailData.replyTo) {
            messageData.replyTo = emailData.replyTo;
        }

        // Add attachments if provided
        if (attachments && attachments.length > 0) {
            const fs = require('fs');
            const path = require('path');
            
            messageData.attachments = attachments
                .filter(att => att && (att.path || att.buffer))
                .map(att => {
                    try {
                        if (att.path && fs.existsSync(att.path)) {
                            const fileContent = fs.readFileSync(att.path);
                            const filename = att.filename || att.originalname || path.basename(att.path);
                            
                            console.log(`📎 Adding attachment: ${filename} (${(fileContent.length / 1024).toFixed(2)} KB)`);
                            
                            return {
                                filename: filename,
                                content: fileContent
                            };
                        } else if (att.buffer) {
                            const filename = att.filename || att.originalname || 'attachment';
                            console.log(`📎 Adding attachment from buffer: ${filename}`);
                            
                            return {
                                filename: filename,
                                content: att.buffer
                            };
                        }
                    } catch (error) {
                        console.error(`❌ Error processing attachment:`, error);
                        return null;
                    }
                    return null;
                })
                .filter(att => att !== null);
            
            console.log(`📎 Total attachments prepared: ${messageData.attachments.length}`);
        }

        // Send email via Resend HTTP API
        const result = await resend.emails.send(messageData);

        // Resend returns { id: 'message-id', ... } or { data: { id: 'message-id' } }
        const messageId = result?.id || result?.data?.id || result?.messageId;

        console.log(`✅ Email sent successfully via Resend: ${templateName}`, {
            to: emailData.to,
            from: emailData.from,
            subject: emailData.subject,
            messageId: messageId || 'sent',
            method: 'HTTP API'
        });

        return {
            success: true,
            messageId: messageId,
            template: templateName
        };
    } catch (error) {
        console.error(`❌ Resend email sending failed (${templateName}):`, {
            message: error.message,
            details: error,
            method: 'HTTP API'
        });

        return {
            success: false,
            error: error.message,
            details: error,
            template: templateName
        };
    }
};

// Test email function
const testEmail = async () => {
    try {
        if (!resend) {
            return {
                success: false,
                error: 'Resend not configured'
            };
        }

        const testEmailAddress = process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL;
        if (!testEmailAddress) {
            return {
                success: false,
                error: 'CONTACT_EMAIL or RESEND_FROM_EMAIL not set'
            };
        }

        const result = await sendEmail('contactFormUser', {
            name: 'Test User',
            email: testEmailAddress,
            phone: '1234567890',
            subject: 'Test Email',
            message: 'This is a test email from Resend integration.'
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
    resend
};

