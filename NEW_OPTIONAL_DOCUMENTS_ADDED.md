# New Optional Documents Added to Registration Form

## Summary
Added four new optional document types to the student registration form system.

## Documents Added
1. **+2 Marksheet** - 12th standard marksheet (optional)
2. **+2 Certificate** - 12th standard certificate (optional)
3. **Graduation Marksheet** - Graduation marksheet (optional)
4. **Graduation Certificate** - Graduation certificate (optional)

## Technical Details

### Backend Configuration
- **File**: `backend/config/documentRequirements.js`
  - Added 4 new document types to the `optional` array
  - Updated `uploadOrder` to include the new documents
  - Added help text for each new document type
  
- **File**: `backend/config/documentTypes.js`
  - Added 4 new document type configurations to the `optional` array
  - Each document configured with validation rules and instructions

### Frontend Configuration
Updated the following files with mock document types (fallback configurations):

1. **frontend/src/components/forms/SimpleDocumentUpload.jsx**
   - Added 4 new mock document types

2. **frontend/src/components/forms/WorkingDocumentUpload.jsx**
   - Added 4 new mock document types

3. **frontend/src/components/shared/DocumentUpload.jsx**
   - Added 4 new document type strings to the dropdown list

4. **frontend/src/components/dashboard/tabs/DocumentsUpload.jsx**
   - Added 4 new document categories and types

5. **frontend/src/components/dashboard/tabs/EnhancedDocumentManagement.jsx**
   - Added new document types to educational category

6. **frontend/src/components/documents/EnhancedDocumentManagement.jsx**
   - Added new document categories

7. **frontend/src/components/forms/EnhancedStudentApplicationForm.jsx**
   - Added 4 new document types with file upload configuration

## Document Specifications

### +2 Marksheet
- **Key**: `twelfth_marksheet`
- **Format**: JPG, JPEG, PNG, PDF
- **Max Size**: 10MB
- **Required**: No

### +2 Certificate
- **Key**: `twelfth_certificate`
- **Format**: JPG, JPEG, PNG, PDF
- **Max Size**: 10MB
- **Required**: No

### Graduation Marksheet
- **Key**: `graduation_marksheet`
- **Format**: JPG, JPEG, PNG, PDF
- **Max Size**: 10MB
- **Required**: No

### Graduation Certificate
- **Key**: `graduation_certificate`
- **Format**: JPG, JPEG, PNG, PDF
- **Max Size**: 10MB
- **Required**: No

## Testing Notes
- All changes have been verified for linter errors
- No breaking changes to existing functionality
- Documents are optional, so existing flows remain unaffected
- The new documents will appear in the registration form's document upload section

## Usage
Students can now upload these additional academic documents during registration if they have completed higher education (12th standard or graduation). These documents are optional and will not block form submission if not provided.

