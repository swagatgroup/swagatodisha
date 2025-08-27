# Web3Forms Setup Guide

## What is Web3Forms?
Web3Forms is a free, privacy-focused form backend service that allows you to handle form submissions without any backend code. It's perfect for static websites and React applications.

## Setup Instructions

### 1. Get Your Access Key
1. Go to [https://web3forms.com/](https://web3forms.com/)
2. Click "Get Access Key"
3. Enter your email address
4. Check your email for the access key
5. Copy the access key (it looks like: `12345678-1234-1234-1234-123456789abc`)

### 2. Update the Access Keys
Replace `9ec47c5e-26a9-46b3-8845-210426d38985` in the following files with your actual access key:

#### Contact Form (src/components/ContactUs.jsx)
```javascript
access_key: 'YOUR_ACTUAL_ACCESS_KEY_HERE'
```

#### Newsletter (src/components/Footer.jsx)
```javascript
access_key: 'YOUR_ACTUAL_ACCESS_KEY_HERE'
```

### 3. Test the Forms
1. Start your development server: `npm run dev`
2. Navigate to the contact form or newsletter
3. Fill out and submit the form
4. Check your email for the form submission
5. You should also see a success message using SweetAlert

## Features Implemented

### Contact Form
- ✅ Form validation with SweetAlert
- ✅ Web3Forms integration
- ✅ Success/error messages
- ✅ Form reset after successful submission
- ✅ Loading states
- ✅ Responsive design

### Newsletter
- ✅ Email validation with SweetAlert
- ✅ Web3Forms integration
- ✅ Success/error messages
- ✅ Form reset after successful subscription
- ✅ Loading states
- ✅ Responsive design

### Apply Now Button
- ✅ Smooth scroll to contact form
- ✅ Works on both desktop and mobile
- ✅ Closes mobile menu when clicked

## SweetAlert Features
- Beautiful success and error messages
- Custom purple theme matching your website
- Professional user experience
- Form validation feedback

## Troubleshooting

### Form Not Sending
1. Check if your access key is correct
2. Ensure you have internet connection
3. Check browser console for errors
4. Verify the access key is active on Web3Forms

### SweetAlert Not Working
1. Ensure SweetAlert2 is installed: `npm install sweetalert2`
2. Check if Swal is imported correctly
3. Verify browser console for any JavaScript errors

### Scroll Not Working
1. Ensure the contact section has `id="contact"`
2. Check if the helper functions are imported correctly
3. Verify the scroll function is called

## Customization

### Change SweetAlert Theme
You can customize the SweetAlert appearance by modifying the `confirmButtonColor` property in the helper functions:

```javascript
confirmButtonColor: '#YOUR_COLOR_HERE'
```

### Modify Form Fields
To add or remove form fields, update both the state and the form JSX in the respective components.

### Change Success Messages
Customize the success and error messages in the form submission handlers.

## Support
If you encounter any issues:
1. Check the Web3Forms documentation
2. Verify your access key is active
3. Test with a simple form first
4. Check browser console for errors
