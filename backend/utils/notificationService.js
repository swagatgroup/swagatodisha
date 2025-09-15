const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email configuration
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// SMS configuration (if using Twilio)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Send email notification
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: html || text,
            text
        };

        await emailTransporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', to);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

// Send SMS notification
const sendSMS = async ({ to, message }) => {
    try {
        if (!twilioClient) {
            console.log('SMS service not configured');
            return false;
        }

        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${to}`
        });

        console.log('SMS sent successfully to:', to);
        return true;
    } catch (error) {
        console.error('SMS sending failed:', error);
        return false;
    }
};

// Send in-app notification (WebSocket)
const sendInAppNotification = async ({ recipient, title, message, data }) => {
    try {
        // This would integrate with your WebSocket service
        // For now, we'll just log it
        console.log('In-app notification:', { recipient, title, message, data });
        return true;
    } catch (error) {
        console.error('In-app notification failed:', error);
        return false;
    }
};

// Centralized notification function
const sendNotification = async ({ type, recipient, title, message, data = {} }) => {
    try {
        // Get user details for notification
        const User = require('../models/User');
        const user = await User.findById(recipient);

        if (!user) {
            console.error('User not found for notification');
            return false;
        }

        const notifications = [];

        // Send email notification
        if (user.email) {
            const emailSent = await sendEmail({
                to: user.email,
                subject: title,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">${title}</h2>
                        <p style="color: #666; line-height: 1.6;">${message}</p>
                        ${data.studentId ? `<p style="color: #888; font-size: 14px;">Student ID: ${data.studentId}</p>` : ''}
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">This is an automated message from Swagat Odisha.</p>
                    </div>
                `,
                text: `${title}\n\n${message}${data.studentId ? `\n\nStudent ID: ${data.studentId}` : ''}`
            });
            notifications.push({ type: 'email', success: emailSent });
        }

        // Send SMS notification
        if (user.phoneNumber) {
            const smsSent = await sendSMS({
                to: user.phoneNumber,
                message: `${title}\n\n${message}${data.studentId ? `\n\nStudent ID: ${data.studentId}` : ''}`
            });
            notifications.push({ type: 'sms', success: smsSent });
        }

        // Send in-app notification
        const inAppSent = await sendInAppNotification({
            recipient,
            title,
            message,
            data
        });
        notifications.push({ type: 'in-app', success: inAppSent });

        // Save notification to database
        const Notification = require('../models/Notification');
        await Notification.create({
            user: recipient,
            type,
            title,
            message,
            data,
            status: 'sent',
            sentAt: new Date()
        });

        console.log('Notification sent:', { type, recipient, notifications });
        return true;

    } catch (error) {
        console.error('Send notification error:', error);
        return false;
    }
};

// Trigger workflow-specific notifications
const triggerWorkflowNotification = async (eventType, studentId, additionalData = {}) => {
    try {
        const Student = require('../models/Student');
        const student = await Student.findById(studentId).populate('user', 'fullName email phoneNumber');

        if (!student) {
            console.error('Student not found for workflow notification');
            return false;
        }

        const notifications = {
            'student_registered': {
                title: 'Registration Successful',
                message: 'Your student registration has been completed successfully. Please complete your profile to proceed.',
                type: 'student_registered'
            },
            'workflow_update': {
                title: 'Application Status Updated',
                message: `Your application status has been updated to: ${additionalData.stage}`,
                type: 'workflow_update'
            },
            'document_approved': {
                title: 'Document Approved',
                message: 'Your document has been approved. You can proceed to the next step.',
                type: 'document_approved'
            },
            'document_rejected': {
                title: 'Document Rejected',
                message: `Your document has been rejected. Reason: ${additionalData.reason}. Please re-upload with corrections.`,
                type: 'document_rejected'
            },
            'payment_required': {
                title: 'Payment Required',
                message: 'Please complete your payment to proceed with the application process.',
                type: 'payment_required'
            },
            'application_approved': {
                title: 'Application Approved',
                message: 'Congratulations! Your application has been approved. Welcome to Swagat Odisha!',
                type: 'application_approved'
            }
        };

        const notification = notifications[eventType];
        if (!notification) {
            console.error('Unknown notification type:', eventType);
            return false;
        }

        return await sendNotification({
            type: notification.type,
            recipient: student.user._id,
            title: notification.title,
            message: notification.message,
            data: {
                studentId: student.studentId,
                ...additionalData
            }
        });

    } catch (error) {
        console.error('Trigger workflow notification error:', error);
        return false;
    }
};

module.exports = {
    sendEmail,
    sendSMS,
    sendInAppNotification,
    sendNotification,
    triggerWorkflowNotification
};