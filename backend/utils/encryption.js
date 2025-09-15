const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        this.saltRounds = 12;

        // Get encryption key from environment or generate one
        this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateKey();
    }

    // Generate a random encryption key
    generateKey() {
        return crypto.randomBytes(this.keyLength).toString('hex');
    }

    // Generate a random IV
    generateIV() {
        return crypto.randomBytes(this.ivLength);
    }

    // Encrypt sensitive data
    encrypt(text) {
        try {
            const iv = this.generateIV();
            const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
            cipher.setAAD(Buffer.from('swagat-odisha', 'utf8'));

            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const tag = cipher.getAuthTag();

            return {
                encrypted,
                iv: iv.toString('hex'),
                tag: tag.toString('hex')
            };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    // Decrypt sensitive data
    decrypt(encryptedData) {
        try {
            const { encrypted, iv, tag } = encryptedData;

            const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
            decipher.setAAD(Buffer.from('swagat-odisha', 'utf8'));
            decipher.setAuthTag(Buffer.from(tag, 'hex'));

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    // Hash password
    async hashPassword(password) {
        try {
            const salt = await bcrypt.genSalt(this.saltRounds);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            console.error('Password hashing error:', error);
            throw new Error('Failed to hash password');
        }
    }

    // Compare password
    async comparePassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error('Password comparison error:', error);
            throw new Error('Failed to compare password');
        }
    }

    // Encrypt PII data (Personal Identifiable Information)
    encryptPII(data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }
        return this.encrypt(data);
    }

    // Decrypt PII data
    decryptPII(encryptedData) {
        const decrypted = this.decrypt(encryptedData);
        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted;
        }
    }

    // Generate secure random token
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    // Generate JWT secret
    generateJWTSecret() {
        return crypto.randomBytes(64).toString('hex');
    }

    // Hash sensitive data for search (one-way hash)
    hashForSearch(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // Generate API key
    generateAPIKey() {
        const prefix = 'sk_';
        const randomPart = crypto.randomBytes(32).toString('hex');
        return prefix + randomPart;
    }

    // Encrypt file content
    encryptFile(buffer) {
        try {
            const iv = this.generateIV();
            const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
            cipher.setAAD(Buffer.from('swagat-odisha-file', 'utf8'));

            let encrypted = cipher.update(buffer);
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            const tag = cipher.getAuthTag();

            return {
                encrypted,
                iv: iv.toString('hex'),
                tag: tag.toString('hex')
            };
        } catch (error) {
            console.error('File encryption error:', error);
            throw new Error('Failed to encrypt file');
        }
    }

    // Decrypt file content
    decryptFile(encryptedData) {
        try {
            const { encrypted, iv, tag } = encryptedData;

            const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
            decipher.setAAD(Buffer.from('swagat-odisha-file', 'utf8'));
            decipher.setAuthTag(Buffer.from(tag, 'hex'));

            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return decrypted;
        } catch (error) {
            console.error('File decryption error:', error);
            throw new Error('Failed to decrypt file');
        }
    }

    // Sanitize data for logging (remove sensitive information)
    sanitizeForLogging(data) {
        const sensitiveFields = [
            'password', 'token', 'secret', 'key', 'aadhar', 'pan', 'bank',
            'account', 'card', 'ssn', 'ssid', 'pin', 'otp', 'cvv'
        ];

        const sanitized = { ...data };

        for (const field in sanitized) {
            if (sensitiveFields.some(sensitive =>
                field.toLowerCase().includes(sensitive.toLowerCase())
            )) {
                sanitized[field] = '[REDACTED]';
            }
        }

        return sanitized;
    }

    // Generate secure session ID
    generateSessionId() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Create HMAC signature
    createHMAC(data, secret = this.encryptionKey) {
        return crypto.createHmac('sha256', secret).update(data).digest('hex');
    }

    // Verify HMAC signature
    verifyHMAC(data, signature, secret = this.encryptionKey) {
        const expectedSignature = this.createHMAC(data, secret);
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    }

    // Encrypt database connection string
    encryptConnectionString(connectionString) {
        return this.encrypt(connectionString);
    }

    // Decrypt database connection string
    decryptConnectionString(encryptedConnectionString) {
        return this.decrypt(encryptedConnectionString);
    }

    // Generate secure random string
    generateRandomString(length = 16) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Encrypt environment variables
    encryptEnvVar(value) {
        return this.encrypt(value);
    }

    // Decrypt environment variables
    decryptEnvVar(encryptedValue) {
        return this.decrypt(encryptedValue);
    }
}

// Create singleton instance
const encryptionService = new EncryptionService();

module.exports = encryptionService;
