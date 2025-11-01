# Contact Form Security Implementation

## 🔒 **Complete Security System**

### **1. Phone Number Validation ✅**

#### **Frontend:**
- ✅ Only accepts digits (non-digits auto-removed)
- ✅ Maximum 10 digits (auto-truncated)
- ✅ Real-time validation as user types
- ✅ Pattern: Must start with 6, 7, 8, or 9 (Indian mobile format)
- ✅ Visual feedback with helper text

#### **Backend:**
- ✅ Strips all non-digits
- ✅ Enforces exactly 10 digits
- ✅ Regex validation: `/^[6-9]\d{9}$/`
- ✅ Returns clear error message on validation failure

---

### **2. Document Upload Security (Multi-Layer Protection) 🛡️**

#### **Layer 1: Initial Filter (Multer)**
- ✅ **File Extension Validation**: Only `.pdf`, `.doc`, `.docx`, `.jpg`, `.jpeg`, `.png`, `.txt`
- ✅ **MIME Type Validation**: Strict whitelist of allowed types
- ✅ **File Size Limit**: Maximum 10MB per file
- ✅ **File Count Limit**: Maximum 5 files per submission
- ✅ **Dangerous Extension Blocking**: Automatically rejects `.exe`, `.bat`, `.php`, `.html`, etc.

#### **Layer 2: File Name Sanitization**
- ✅ **Path Traversal Protection**: Removes `../` and `/` sequences
- ✅ **XSS Prevention**: Removes dangerous characters (`<`, `>`, `:`, `"`, `|`, `?`, `*`)
- ✅ **Null Byte Removal**: Prevents null byte injection
- ✅ **Length Limiting**: Maximum 255 characters
- ✅ **Unique Naming**: Adds timestamp + random number to prevent conflicts

#### **Layer 3: Magic Bytes Validation (File Signature Verification)**
- ✅ **File Type Verification**: Reads actual file headers (magic bytes)
- ✅ **Disguise Detection**: Detects files renamed with wrong extensions
- ✅ **Supported Signatures**:
  - PDF: `%PDF` (0x25 0x50 0x44 0x46)
  - JPEG: `FF D8 FF`
  - PNG: `89 50 4E 47 0D 0A 1A 0A`
  - DOC: `D0 CF 11 E0 A1 B1 1A E1`
  - DOCX/XLSX: `50 4B 03 04` (ZIP format)

#### **Layer 4: Content Scanning**
- ✅ **Malicious Pattern Detection**: Scans for:
  - `<script>` tags
  - `<iframe>` tags
  - `javascript:` URLs
  - `eval()`, `system()`, `exec()` functions
  - Base64 decode attempts
  - Shell execution patterns
- ✅ **Text File Analysis**: Reads and scans text-based files
- ✅ **Binary File Size Check**: Validates binary files aren't suspiciously large

#### **Layer 5: Extension-MIME Type Match Verification**
- ✅ **Cross-Verification**: Ensures file extension matches declared MIME type
- ✅ **Double-Check Security**: Prevents MIME type spoofing
- ✅ **Type Consistency**: Validates `.jpg` = `image/jpeg`, `.pdf` = `application/pdf`, etc.

#### **Layer 6: Post-Upload Validation**
- ✅ **Complete Security Scan**: Runs after file is uploaded
- ✅ **Automatic Cleanup**: Deletes unsafe files immediately
- ✅ **Request Rejection**: Rejects entire submission if any file fails
- ✅ **Detailed Error Reporting**: Returns specific validation errors

---

### **3. Anti-Spam Protection 🚫**

#### **Rate Limiting:**
- ✅ **3 submissions per hour** per IP address
- ✅ Automatic IP blocking after excessive attempts
- ✅ Tracked in-memory with cleanup

#### **Honeypot Field:**
- ✅ Hidden `website_url` field invisible to users
- ✅ Bots that fill it are immediately blocked
- ✅ IP address automatically blacklisted

#### **Google reCAPTCHA v3:**
- ✅ Background verification (invisible to users)
- ✅ Score threshold: 0.5+ (below = bot)
- ✅ Action-specific: `contact_form`
- ✅ Fail-open if service unavailable (doesn't block legitimate users)

#### **Spam Pattern Detection:**
- ✅ Random character strings
- ✅ Repeated characters
- ✅ Gibberish patterns
- ✅ High entropy detection
- ✅ Email domain validation (blocks temp emails)

#### **Email Domain Validation:**
- ✅ Blocks temporary email services
- ✅ Validates domain authenticity
- ✅ Checks for suspicious patterns

---

### **4. Input Validation & Sanitization 🧹**

#### **Name Field:**
- ✅ Only letters and spaces
- ✅ 2-100 characters
- ✅ Server-side regex validation

#### **Email Field:**
- ✅ Valid email format
- ✅ Email normalization
- ✅ Domain validation
- ✅ Blocks suspicious domains

#### **Phone Field:**
- ✅ Exactly 10 digits
- ✅ Indian mobile format (6-9 start)
- ✅ Automatic digit-only sanitization

#### **Subject Field:**
- ✅ 3-200 characters
- ✅ Trims whitespace
- ✅ Spam pattern detection

#### **Message Field:**
- ✅ 10-5000 characters
- ✅ Trims whitespace
- ✅ Spam pattern detection

---

### **5. File Processing Security 📁**

#### **Automatic Cleanup:**
- ✅ Files deleted on validation failure
- ✅ Files deleted after email processing
- ✅ Temporary files cleaned up
- ✅ Error handling with cleanup

#### **Secure Storage:**
- ✅ Isolated upload directory
- ✅ Random unique filenames
- ✅ No direct file access via URL
- ✅ Proper permissions

#### **Error Handling:**
- ✅ Graceful failure
- ✅ Detailed error messages
- ✅ No information leakage
- ✅ Proper cleanup on errors

---

### **6. Security Headers (Server-Wide) 🔐**

Already implemented via `helmet.js`:
- ✅ XSS Protection
- ✅ Content Security Policy
- ✅ Frame Options
- ✅ MIME Type Sniffing Prevention
- ✅ HSTS (if configured)

---

## 📊 **Security Flow Diagram**

```
User Submission
    ↓
1. Rate Limiting Check
    ↓ (if passed)
2. File Upload (Multer)
    ├─ Extension Check
    ├─ MIME Type Check
    ├─ Size Check
    └─ Count Check
    ↓
3. File Name Sanitization
    ↓
4. Magic Bytes Verification
    ↓
5. Content Scanning
    ↓
6. Extension-MIME Match
    ↓
7. Honeypot Check
    ↓
8. reCAPTCHA Verification
    ↓
9. Email Domain Validation
    ↓
10. Spam Pattern Detection
    ↓
11. Input Validation
    ↓
12. Process & Email
    ↓
13. Cleanup Files
```

---

## ✅ **What This Protects Against**

1. ✅ **Malicious File Uploads**: EXE, scripts, executables
2. ✅ **Disguised Files**: PDF renamed as JPG, etc.
3. ✅ **Path Traversal**: `../../../etc/passwd` attacks
4. ✅ **XSS Attacks**: Script injection in filenames
5. ✅ **Spam Submissions**: Automated bot attacks
6. ✅ **Rate Limit Abuse**: Too many submissions
7. ✅ **File Size Attacks**: Denial of service via large files
8. ✅ **MIME Type Spoofing**: Fake content type declarations
9. ✅ **Malicious Content**: Scripts in documents
10. ✅ **Invalid Phone Numbers**: Wrong format, wrong length
11. ✅ **Temporary Emails**: Disposable email addresses
12. ✅ **Honeypot Traps**: Bot detection

---

## 🎯 **Testing Recommendations**

1. **Test Phone Validation:**
   - Try: `1234567890` (should accept if starts with 6-9)
   - Try: `9876543210` (should accept)
   - Try: `123456789` (should reject - only 9 digits)
   - Try: `12345678901` (should reject - 11 digits)

2. **Test File Security:**
   - Try uploading `.exe` file → Should reject
   - Try renaming `.exe` to `.pdf` → Should reject (magic bytes check)
   - Try uploading PDF with script tags → Should reject
   - Try uploading oversized file → Should reject

3. **Test Rate Limiting:**
   - Submit form 4 times in 1 hour → 4th should be blocked

4. **Test Honeypot:**
   - Fill hidden `website_url` field → Should be blocked

---

## 📝 **Notes**

- All security checks run server-side (cannot be bypassed)
- Files are immediately deleted if validation fails
- Multiple layers ensure comprehensive protection
- System is production-ready and secure

