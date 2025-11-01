const fs = require('fs');
const path = require('path');

/**
 * File Security Utility
 * Comprehensive security checks for uploaded files
 */

// Magic bytes (file signatures) for common document types
const FILE_SIGNATURES = {
    'application/pdf': [
        Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
    ],
    'image/jpeg': [
        Buffer.from([0xFF, 0xD8, 0xFF]),
    ],
    'image/png': [
        Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG signature
    ],
    'image/jpg': [
        Buffer.from([0xFF, 0xD8, 0xFF]),
    ],
    'application/msword': [
        Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]), // Old Word .doc
    ],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        // .docx is a ZIP file, check for PK header
        Buffer.from([0x50, 0x4B, 0x03, 0x04]),
    ],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        Buffer.from([0x50, 0x4B, 0x03, 0x04]), // .xlsx is ZIP
    ],
    'text/plain': [
        // Text files don't have a signature, but we can check for readable content
        null, // Will check differently
    ],
};

// Map extensions to expected MIME types
const EXTENSION_TO_MIME = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.txt': 'text/plain',
};

// Dangerous file extensions that should NEVER be allowed
const DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.app', '.deb', '.pkg', '.rpm', '.dmg', '.sh', '.ps1', '.msi', '.dll',
    '.php', '.asp', '.aspx', '.jsp', '.html', '.htm', '.xml', '.svg',
    '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.iso', '.bin',
];

// Malicious patterns to scan for in file content
const MALICIOUS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /onerror=/gi,
    /onload=/gi,
    /eval\(/gi,
    /base64_decode/gi,
    /system\(/gi,
    /exec\(/gi,
    /shell_exec/gi,
    /passthru\(/gi,
    /proc_open/gi,
    /popen\(/gi,
];

/**
 * Read first N bytes of file to check signature
 */
const readFileHeader = (filePath, bytes = 16) => {
    try {
        const buffer = Buffer.alloc(bytes);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, bytes, 0);
        fs.closeSync(fd);
        return buffer;
    } catch (error) {
        console.error('Error reading file header:', error);
        return null;
    }
};

/**
 * Verify file type using magic bytes
 */
const verifyFileTypeBySignature = (filePath, expectedMimeType) => {
    try {
        const fileHeader = readFileHeader(filePath, 16);
        if (!fileHeader) return false;

        const signatures = FILE_SIGNATURES[expectedMimeType];
        if (!signatures) {
            // For text files, we'll do a different check
            if (expectedMimeType === 'text/plain') {
                return true; // Allow text files
            }
            return false;
        }

        // Check if file header matches any known signature
        return signatures.some(signature => {
            if (!signature) return true; // Allow if no signature defined
            return fileHeader.slice(0, signature.length).equals(signature);
        });
    } catch (error) {
        console.error('Error verifying file signature:', error);
        return false;
    }
};

/**
 * Scan file content for malicious patterns
 */
const scanForMaliciousContent = (filePath, mimeType) => {
    try {
        // Only scan text-based files (skip binary files like images)
        if (mimeType.startsWith('image/')) {
            return { safe: true, threats: [] };
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const threats = [];

        for (const pattern of MALICIOUS_PATTERNS) {
            if (pattern.test(content)) {
                threats.push(`Malicious pattern detected: ${pattern.source}`);
            }
        }

        return {
            safe: threats.length === 0,
            threats
        };
    } catch (error) {
        // If file can't be read as text, it's likely binary - check size
        const stats = fs.statSync(filePath);
        if (stats.size > 50 * 1024 * 1024) { // 50MB
            return { safe: false, threats: ['File size suspiciously large'] };
        }
        return { safe: true, threats: [] };
    }
};

/**
 * Sanitize filename to prevent path traversal and XSS
 */
const sanitizeFilename = (filename) => {
    // Remove path traversal attempts
    let sanitized = filename.replace(/\.\./g, '').replace(/\//g, '_').replace(/\\/g, '_');

    // Remove any null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');

    // Limit length
    if (sanitized.length > 255) {
        const ext = path.extname(sanitized);
        const name = path.basename(sanitized, ext);
        sanitized = name.slice(0, 255 - ext.length) + ext;
    }

    return sanitized || 'unnamed-file';
};

/**
 * Validate file extension against MIME type
 */
const validateExtensionMatchesMime = (filename, mimeType) => {
    const ext = path.extname(filename).toLowerCase();
    const expectedMime = EXTENSION_TO_MIME[ext];

    if (!expectedMime) {
        return false;
    }

    // Some MIME types can match multiple extensions
    if (expectedMime === mimeType) {
        return true;
    }

    // Special cases
    if ((ext === '.jpg' || ext === '.jpeg') && mimeType === 'image/jpeg') {
        return true;
    }

    return false;
};

/**
 * Check if extension is dangerous
 */
const isDangerousExtension = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    return DANGEROUS_EXTENSIONS.includes(ext);
};

/**
 * Comprehensive file security validation
 */
const validateFileSecurity = async (filePath, originalName, mimeType) => {
    const results = {
        safe: true,
        errors: [],
        warnings: []
    };

    // 1. Check for dangerous extensions
    if (isDangerousExtension(originalName)) {
        results.safe = false;
        results.errors.push('File extension is not allowed for security reasons');
        return results;
    }

    // 2. Validate extension matches MIME type
    if (!validateExtensionMatchesMime(originalName, mimeType)) {
        results.safe = false;
        results.errors.push('File extension does not match the file type');
        return results;
    }

    // 3. Verify file type using magic bytes
    const signatureValid = verifyFileTypeBySignature(filePath, mimeType);
    if (!signatureValid) {
        results.safe = false;
        results.errors.push('File type verification failed - file may be corrupted or disguised');
        return results;
    }

    // 4. Scan for malicious content (only for text-based files)
    const scanResult = scanForMaliciousContent(filePath, mimeType);
    if (!scanResult.safe) {
        results.safe = false;
        results.errors.push(...scanResult.threats);
        return results;
    }

    // 5. Check file size (additional check)
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
        results.safe = false;
        results.errors.push('File is empty');
        return results;
    }

    if (stats.size > 10 * 1024 * 1024) { // 10MB
        results.safe = false;
        results.errors.push('File exceeds maximum size limit');
        return results;
    }

    return results;
};

module.exports = {
    validateFileSecurity,
    sanitizeFilename,
    verifyFileTypeBySignature,
    scanForMaliciousContent,
    isDangerousExtension,
    validateExtensionMatchesMime
};

