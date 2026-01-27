# Production Test Checklist

## ✅ Pre-Deployment Checks

### Backend Environment Variables
- [ ] `MONGODB_URI` - Database connection
- [ ] `JWT_SECRET` - Authentication token secret
- [ ] `CLOUDINARY_CLOUD_NAME` - PDF/document storage
- [ ] `CLOUDINARY_API_KEY` - Cloudinary access
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary secret
- [ ] `RESEND_API_KEY` - Email service
- [ ] `RESEND_FROM_EMAIL` - Email sender address
- [ ] `NODE_ENV=production` - Environment mode

### Frontend Environment Variables
- [ ] `VITE_API_BASE_URL` - Backend API URL
- [ ] `VITE_RECAPTCHA_SITE_KEY` - reCAPTCHA key (if used)

---

## 🧪 Critical Functionality Tests

### 1. User Authentication
- [ ] User can log in
- [ ] User can log out
- [ ] Token persists across page refreshes
- [ ] Protected routes redirect to login
- [ ] Invalid credentials show error

### 2. Student Registration Flow
- [ ] Can fill personal details form
- [ ] Can fill contact details form
- [ ] Can fill course details form
- [ ] Can fill guardian details form
- [ ] Can upload documents
- [ ] Form validation works (required fields)
- [ ] Date format validation (DD/MM/YYYY)
- [ ] Phone number validation (10 digits)
- [ ] Aadhar validation (12 digits)
- [ ] Email validation

### 3. PDF Generation
- [ ] PDF generates successfully
- [ ] PDF is exactly 2 pages
- [ ] All form data appears in PDF
- [ ] Document links work in PDF
- [ ] Terms and conditions are complete
- [ ] Signature sections are present
- [ ] PDF can be downloaded
- [ ] PDF can be previewed

### 4. PDF Upload & Storage
- [ ] PDF uploads to backend after generation
- [ ] PDF is stored in Cloudinary
- [ ] PDF URL is saved in database
- [ ] PDF can be retrieved from dashboard
- [ ] PDF opens in new tab correctly
- [ ] PDF downloads with correct filename

### 5. Application Submission
- [ ] Can submit application after PDF generation
- [ ] Application saves to database
- [ ] Application ID is generated
- [ ] Application status is correct
- [ ] Guardian relationship validation works
- [ ] Invalid relationship values are normalized
- [ ] Submission redirects to dashboard
- [ ] Success message appears

### 6. Dashboard Functionality
- [ ] Submitted applications appear in dashboard
- [ ] Can view application details
- [ ] Can view PDF from dashboard
- [ ] PDF button works in student table
- [ ] Application status is displayed correctly
- [ ] Search/filter works (if applicable)

### 7. Email Service (Resend)
- [ ] Contact form sends email
- [ ] Admin receives contact form emails
- [ ] User receives confirmation email
- [ ] Attachments are included in emails
- [ ] Email formatting is correct

### 8. Error Handling
- [ ] Network errors are handled gracefully
- [ ] Validation errors show user-friendly messages
- [ ] 500 errors don't expose sensitive info
- [ ] 401 errors redirect to login
- [ ] 404 errors show appropriate messages
- [ ] PDF upload failures are handled
- [ ] Application submission failures are handled

### 9. Data Validation
- [ ] Guardian relationship enum validation
- [ ] Phone number format validation
- [ ] Email format validation
- [ ] Date format validation
- [ ] Required field validation
- [ ] File upload validation (size, type)

### 10. Performance & UX
- [ ] Page loads within acceptable time
- [ ] PDF generation completes in reasonable time
- [ ] Forms are responsive
- [ ] Loading indicators appear during operations
- [ ] Success/error messages are clear
- [ ] No console errors in production

---

## 🔍 Production-Specific Tests

### API Endpoints
- [ ] `POST /api/student-application/create` - Creates draft
- [ ] `PUT /api/student-application/:id/submit` - Submits application
- [ ] `POST /api/student-application/:id/upload-pdf` - Uploads PDF
- [ ] `GET /api/student-application/:id/pdf` - Gets PDF URL
- [ ] `GET /api/student-application/:id/pdf-file` - Serves PDF file
- [ ] `POST /api/contact/submit` - Contact form submission

### Database
- [ ] Applications are saved correctly
- [ ] PDF URLs are stored correctly
- [ ] Application IDs are unique
- [ ] User associations are correct
- [ ] Timestamps are recorded

### Cloudinary
- [ ] PDFs upload successfully
- [ ] PDFs are accessible via URL
- [ ] PDFs have correct permissions
- [ ] File naming is consistent

### Security
- [ ] CORS is configured correctly
- [ ] Authentication tokens are secure
- [ ] File uploads are validated
- [ ] SQL injection prevention (if applicable)
- [ ] XSS prevention

---

## 🐛 Known Issues to Monitor

1. **PDF Upload Timing** - Ensure PDF uploads before submission
2. **Guardian Relationship** - Monitor for any invalid values
3. **Application Visibility** - Ensure applications appear in dashboard
4. **Email Delivery** - Monitor Resend email delivery rates
5. **Cloudinary Limits** - Monitor storage usage

---

## 📊 Monitoring Checklist

- [ ] Error logs are being collected
- [ ] Application metrics are tracked
- [ ] User activity is logged
- [ ] API response times are monitored
- [ ] Database performance is monitored
- [ ] Email delivery rates are tracked

---

## 🚨 Rollback Plan

If critical issues are found:
1. Revert to previous stable version
2. Check database for data integrity
3. Verify backups are current
4. Notify users if needed
5. Document issues for fix

---

## ✅ Sign-Off

- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Performance is acceptable
- [ ] Security checks passed
- [ ] Ready for production use

**Tested by:** _______________  
**Date:** _______________  
**Version:** _______________

