const axios = require('axios');
const rateLimit = require('express-rate-limit');

// In-memory store for IP tracking (use Redis in production)
const ipSubmissionStore = new Map();
const blockedIPs = new Set();

// Clean up old entries every hour
setInterval(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    for (const [ip, data] of ipSubmissionStore.entries()) {
        // Remove entries older than 24 hours
        data.submissions = data.submissions.filter(timestamp => timestamp > oneDayAgo);
        if (data.submissions.length === 0) {
            ipSubmissionStore.delete(ip);
        }
    }
}, 60 * 60 * 1000);

// Enhanced rate limiter specifically for contact form (stricter)
const contactFormRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Only 3 submissions per hour per IP
    message: {
        success: false,
        message: 'Too many contact form submissions. Please try again later.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        console.warn(`🚫 Rate limit exceeded for contact form - IP: ${ip}`);

        // Track excessive attempts
        if (!ipSubmissionStore.has(ip)) {
            ipSubmissionStore.set(ip, { submissions: [], flagged: false });
        }
        const ipData = ipSubmissionStore.get(ip);
        ipData.flagged = true;

        res.status(429).json({
            success: false,
            message: 'Too many contact form submissions. Please try again later.',
            retryAfter: 3600
        });
    }
});

// Honeypot field validation
const checkHoneypot = (req, res, next) => {
    // Check for honeypot field - bots often fill hidden fields
    // Note: Must run AFTER multer/form parsing middleware
    const honeypotFields = req.body?.website_url || req.body?.company_website || req.body?.url;
    if (honeypotFields && honeypotFields.trim() !== '') {
        const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
        console.warn(`🪤 Honeypot triggered - IP: ${ip}, Field: ${honeypotFields}`);

        // Auto-block IP after honeypot trigger
        blockedIPs.add(ip);

        // Clean up uploaded files if any
        if (req.files && req.files.length > 0) {
            const fs = require('fs');
            req.files.forEach(file => {
                try {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                } catch (err) {
                    // Ignore cleanup errors
                }
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Invalid form submission detected.'
        });
    }
    next();
};

// Spam pattern detection
const detectSpamPatterns = (text) => {
    if (!text || typeof text !== 'string') return false;

    const spamPatterns = [
        // Random character strings (like in the screenshot)
        /^[A-Za-z]{15,}$/, // All caps/lowercase random letters
        /([A-Z][a-z]){8,}/, // Mixed case random pattern
        // Repeated characters
        /(.)\1{10,}/,
        // Gibberish patterns
        /[a-zA-Z]{5,}[0-9]{3,}[a-zA-Z]{5,}/,
        // Very short messages with random chars
        /^[A-Za-z]{10,20}$/,
    ];

    // Check if text matches spam patterns
    for (const pattern of spamPatterns) {
        if (pattern.test(text)) {
            // Additional check: if it's too random (high entropy)
            const uniqueChars = new Set(text.toLowerCase().replace(/\s/g, ''));
            const entropy = uniqueChars.size / text.replace(/\s/g, '').length;

            // Random strings usually have high entropy (> 0.7)
            if (entropy > 0.7 && text.length > 15) {
                return true;
            }
        }
    }

    return false;
};

// Email domain validation
const validateEmailDomain = (email) => {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    // Extract domain
    const domain = email.split('@')[1];

    // List of suspicious/temporary email domains
    const suspiciousDomains = [
        'tempmail.com',
        '10minutemail.com',
        'guerrillamail.com',
        'mailinator.com',
        'throwaway.email',
        'yopmail.com',
        'temp-mail.org'
    ];

    // Check against suspicious domains
    if (suspiciousDomains.some(susp => domain.includes(susp))) {
        return false;
    }

    // Check for random-looking domain names
    const domainParts = domain.split('.');
    const mainDomain = domainParts[0];

    // If domain is random characters (like in spam)
    if (/^[A-Za-z]{15,}$/.test(mainDomain)) {
        return false;
    }

    return true;
};

// Google reCAPTCHA v3 verification
const verifyRecaptcha = async (recaptchaToken) => {
    if (!recaptchaToken) {
        return { success: false, error: 'reCAPTCHA token missing' };
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        console.warn('⚠️ RECAPTCHA_SECRET_KEY not set, skipping reCAPTCHA verification');
        return { success: true, score: 0.5 }; // Allow if not configured
    }

    try {
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: secretKey,
                    response: recaptchaToken
                }
            }
        );

        const { success, score, action } = response.data;

        // Score threshold: 0.5 and above is human, below is bot
        if (success && score >= 0.5) {
            return { success: true, score, action };
        } else {
            return {
                success: false,
                score: score || 0,
                error: 'reCAPTCHA verification failed - suspected bot activity'
            };
        }
    } catch (error) {
        console.error('reCAPTCHA verification error:', error.message);
        // Fail open if service is down (don't block legitimate users)
        return { success: true, score: 0.5, error: 'reCAPTCHA service unavailable' };
    }
};

// Main anti-spam middleware
const antiSpamMiddleware = async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

    // Check if IP is blocked
    if (blockedIPs.has(ip)) {
        console.warn(`🚫 Blocked IP attempted contact form: ${ip}`);
        return res.status(403).json({
            success: false,
            message: 'Access denied. Your IP has been blocked due to suspicious activity.'
        });
    }

    // Ensure body is parsed (should be after multer)
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Invalid request format.'
        });
    }

    const { name, email, phone, subject, message, recaptcha_token } = req.body;

    // Basic validation before spam checks
    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'All required fields must be provided.'
        });
    }

    // 1. Verify reCAPTCHA
    const recaptchaResult = await verifyRecaptcha(recaptcha_token);
    if (!recaptchaResult.success) {
        console.warn(`🤖 reCAPTCHA failed - IP: ${ip}, Score: ${recaptchaResult.score}`);

        // Track failed attempts
        if (!ipSubmissionStore.has(ip)) {
            ipSubmissionStore.set(ip, { submissions: [], flagged: false });
        }
        const ipData = ipSubmissionStore.get(ip);
        ipData.submissions.push(Date.now());

        // Block after 3 failed attempts
        if (ipData.submissions.filter(ts => Date.now() - ts < 3600000).length >= 3) {
            blockedIPs.add(ip);
        }

        return res.status(400).json({
            success: false,
            message: 'Security verification failed. Please refresh and try again.'
        });
    }

    // 2. Validate email domain
    if (!validateEmailDomain(email)) {
        console.warn(`📧 Suspicious email domain - IP: ${ip}, Email: ${email}`);
        return res.status(400).json({
            success: false,
            message: 'Please use a valid email address.'
        });
    }

    // 3. Detect spam patterns in name, subject, and message
    if (detectSpamPatterns(name)) {
        console.warn(`🔍 Spam pattern detected in name - IP: ${ip}`);
        blockedIPs.add(ip);
        return res.status(400).json({
            success: false,
            message: 'Invalid form data detected.'
        });
    }

    if (detectSpamPatterns(subject)) {
        console.warn(`🔍 Spam pattern detected in subject - IP: ${ip}`);
        blockedIPs.add(ip);
        return res.status(400).json({
            success: false,
            message: 'Invalid form data detected.'
        });
    }

    if (detectSpamPatterns(message)) {
        console.warn(`🔍 Spam pattern detected in message - IP: ${ip}`);
        blockedIPs.add(ip);
        return res.status(400).json({
            success: false,
            message: 'Invalid form data detected.'
        });
    }

    // 4. Track successful submission
    if (!ipSubmissionStore.has(ip)) {
        ipSubmissionStore.set(ip, { submissions: [], flagged: false });
    }
    const ipData = ipSubmissionStore.get(ip);
    ipData.submissions.push(Date.now());

    // Block if more than 5 submissions in last hour
    const recentSubmissions = ipData.submissions.filter(ts => Date.now() - ts < 3600000);
    if (recentSubmissions.length > 5) {
        console.warn(`⚠️ Excessive submissions detected - IP: ${ip}, Count: ${recentSubmissions.length}`);
        blockedIPs.add(ip);
        return res.status(429).json({
            success: false,
            message: 'Too many submissions. Please contact us directly.'
        });
    }

    next();
};

module.exports = {
    contactFormRateLimit,
    checkHoneypot,
    antiSpamMiddleware,
    blockedIPs, // Export for admin viewing if needed
    ipSubmissionStore // Export for admin viewing if needed
};

