# Quick Manual Test Guide for Production

## 🚀 Quick Start Testing

### 1. Test User Login (2 minutes)
1. Go to login page
2. Enter credentials
3. ✅ Should log in successfully
4. ✅ Should redirect to dashboard

### 2. Test Student Registration Form (5 minutes)
1. Navigate to registration form
2. Fill in **Personal Details**:
   - Full Name: "Test Student"
   - DOB: "01/01/2000"
   - Gender: Select any
   - Aadhar: "123456789012"
   - Category: Select any
   - Father's Name: "Test Father"
   - Mother's Name: "Test Mother"
3. Fill in **Contact Details**:
   - Email: "test@example.com"
   - Phone: "9876543210"
   - Address: Fill all fields
4. Fill in **Course Details**:
   - Select college and course
5. Fill in **Guardian Details**:
   - Name: "Test Guardian"
   - Relationship: Select "Father" (or any valid option)
   - Phone: "9876543210"
6. ✅ All fields should validate correctly
7. ✅ Form should save as draft

### 3. Test PDF Generation (3 minutes)
1. Click "Generate PDF" button
2. ✅ PDF should generate (takes 5-10 seconds)
3. ✅ PDF should be exactly 2 pages
4. ✅ All form data should appear in PDF
5. ✅ Terms and conditions should be complete
6. ✅ Can download PDF
7. ✅ Can preview PDF

### 4. Test PDF Upload & Storage (2 minutes)
1. After PDF generation, check browser console
2. ✅ Should see "PDF uploaded successfully" message
3. ✅ Should see Cloudinary URL in console
4. Submit application
5. ✅ Application should submit successfully

### 5. Test Application Submission (2 minutes)
1. After PDF generation, click "Submit Application"
2. ✅ Should show "Uploading PDF..." message
3. ✅ Should show "Application submitted successfully"
4. ✅ Should redirect to dashboard
5. ✅ Application should appear in dashboard

### 6. Test Dashboard PDF Viewing (2 minutes)
1. Go to dashboard
2. Find submitted application
3. Click PDF icon/button
4. ✅ PDF should open in new tab
5. ✅ PDF should have correct filename
6. ✅ PDF should display correctly

### 7. Test Guardian Relationship Normalization (2 minutes)
1. Fill form with invalid relationship (if possible)
2. Or use mock data that might have "Guardian"
3. Submit application
4. ✅ Should not show validation error
5. ✅ Should save with "Other" if invalid value was used

### 8. Test Contact Form (2 minutes)
1. Go to contact page
2. Fill form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "9876543210"
   - Subject: "Test"
   - Message: "Test message"
3. Submit
4. ✅ Should show success message
5. ✅ Admin should receive email (check Resend dashboard)

---

## ⚠️ Common Issues to Check

### PDF Not Uploading
- Check browser console for errors
- Check backend logs for Cloudinary errors
- Verify Cloudinary credentials are set

### Application Not Appearing in Dashboard
- Check if application was actually saved
- Verify user is logged in
- Check application status
- Verify dashboard query filters

### Guardian Relationship Error
- Should be fixed with normalization
- Check backend logs if still occurs
- Verify enum values match

### Email Not Sending
- Check Resend API key
- Check Resend dashboard for delivery status
- Verify FROM email is verified in Resend

---

## 🔍 Browser Console Checks

Open browser DevTools (F12) and check:

1. **No Red Errors** - Should see no critical errors
2. **API Calls** - All API calls should return 200/201
3. **PDF Upload** - Should see "PDF uploaded successfully"
4. **Application Save** - Should see "Application created successfully"

---

## 📱 Test on Different Devices

- [ ] Desktop browser (Chrome/Firefox)
- [ ] Mobile browser
- [ ] Tablet browser
- [ ] Different screen sizes

---

## ✅ Success Criteria

All tests should complete without errors:
- ✅ Forms submit successfully
- ✅ PDFs generate and upload
- ✅ Applications appear in dashboard
- ✅ PDFs can be viewed/downloaded
- ✅ No console errors
- ✅ No validation errors

---

## 🐛 If Tests Fail

1. Check browser console for errors
2. Check backend logs
3. Verify environment variables
4. Check database connection
5. Verify Cloudinary/Resend credentials
6. Check network connectivity

---

**Test Date:** _______________  
**Tester:** _______________  
**Results:** _______________

