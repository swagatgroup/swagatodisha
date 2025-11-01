const documentRequirements = {
    // Required documents
    required: [
        {
            key: 'passport_photo',
            label: 'Passport Size Photo',
            description: 'Recent passport size photograph (35mm x 45mm)',
            allowedFormats: ['jpg', 'jpeg', 'png'],
            maxSize: 5 * 1024 * 1024, // 5MB
            validation: {
                minWidth: 200,
                minHeight: 200,
                aspectRatio: { width: 35, height: 45 }
            }
        },
        {
            key: 'aadhar_card',
            label: 'Aadhar Card',
            description: 'Front and back of Aadhar card',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: true
            }
        },
        {
            key: 'tenth_marksheet_certificate',
            label: '10th Marksheet cum Certificate',
            description: '10th class marksheet and certificate (combined document)',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: true,
                note: 'If marksheet and certificate are separate, upload both as combined PDF'
            }
        },
        {
            key: 'caste_certificate',
            label: 'Caste Certificate',
            description: 'Caste certificate (not older than 5 years)',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: true,
                maxAge: 5, // years
                checkDate: true
            }
        },
        {
            key: 'income_certificate',
            label: 'Income Certificate',
            description: 'Income certificate (not older than 1 year)',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: true,
                maxAge: 1, // year
                checkDate: true
            }
        }
    ],

    // Optional documents
    optional: [
        {
            key: 'resident_certificate',
            label: 'Resident Certificate',
            description: 'Resident certificate (optional)',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: false
            }
        },
        {
            key: 'twelfth_marksheet',
            label: '+2 Marksheet',
            description: '12th standard marksheet (optional)',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: false
            }
        },
        {
            key: 'twelfth_certificate',
            label: '+2 Certificate',
            description: '12th standard certificate (optional)',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: false
            }
        },
        {
            key: 'graduation_marksheet',
            label: 'Graduation Marksheet',
            description: 'Graduation marksheet (optional)',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: false
            }
        },
        {
            key: 'graduation_certificate',
            label: 'Graduation Certificate',
            description: 'Graduation certificate (optional)',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: false
            }
        },
        {
            key: 'pm_kisan_enrollment',
            label: 'PM Kisan Enrollment',
            description: 'PM Kisan enrollment certificate (for OBC free education)',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: false,
                category: 'obc_benefit'
            }
        },
        {
            key: 'cm_kisan_enrollment',
            label: 'CM Kisan Enrollment',
            description: 'CM Kisan enrollment certificate (for OBC free education)',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: 10 * 1024 * 1024, // 10MB
            validation: {
                required: false,
                category: 'obc_benefit'
            }
        }
    ],

    // Custom document upload
    custom: {
        enabled: true,
        maxCustomDocuments: 5,
        allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
        maxSize: 10 * 1024 * 1024, // 10MB
        validation: {
            labelRequired: true,
            maxLabelLength: 50
        }
    },

    // Document validation rules
    validationRules: {
        // Check if document is not older than specified years
        checkDocumentAge: (documentDate, maxAgeInYears) => {
            if (!documentDate) return true; // Skip if no date provided
            const now = new Date();
            const docDate = new Date(documentDate);
            const ageInYears = (now - docDate) / (1000 * 60 * 60 * 24 * 365);
            return ageInYears <= maxAgeInYears;
        },

        // Validate image dimensions for passport photo
        validatePassportPhoto: (file) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    const expectedRatio = 35 / 45; // 35mm x 45mm
                    const tolerance = 0.1; // 10% tolerance
                    resolve(Math.abs(aspectRatio - expectedRatio) <= tolerance);
                };
                img.onerror = () => resolve(false);
                img.src = URL.createObjectURL(file);
            });
        },

        // Get document category for special handling
        getDocumentCategory: (documentType) => {
            const obcBenefitDocs = ['pm_kisan_enrollment', 'cm_kisan_enrollment'];
            return obcBenefitDocs.includes(documentType) ? 'obc_benefit' : 'general';
        }
    },

    // Document upload order (for better UX)
    uploadOrder: [
        'passport_photo',
        'aadhar_card',
        'tenth_marksheet_certificate',
        'caste_certificate',
        'income_certificate',
        'resident_certificate',
        'twelfth_marksheet',
        'twelfth_certificate',
        'graduation_marksheet',
        'graduation_certificate',
        'pm_kisan_enrollment',
        'cm_kisan_enrollment'
    ],

    // Help text for users
    helpText: {
        passport_photo: 'Upload a clear passport size photo (35mm x 45mm) with white background',
        aadhar_card: 'Upload both front and back of Aadhar card in a single file or separate files',
        tenth_marksheet_certificate: 'Upload 10th marksheet and certificate. If they are separate documents, combine them into a single PDF',
        caste_certificate: 'Upload caste certificate issued within the last 5 years',
        income_certificate: 'Upload income certificate issued within the last 1 year',
        resident_certificate: 'Upload resident certificate if available',
        pm_kisan_enrollment: 'Upload PM Kisan enrollment certificate for OBC free education benefit',
        cm_kisan_enrollment: 'Upload CM Kisan enrollment certificate for OBC free education benefit',
        twelfth_marksheet: 'Upload 12th standard marksheet if available',
        twelfth_certificate: 'Upload 12th standard certificate if available',
        graduation_marksheet: 'Upload graduation marksheet if available',
        graduation_certificate: 'Upload graduation certificate if available'
    }
};

module.exports = documentRequirements;
