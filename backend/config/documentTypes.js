// Document Types Configuration for Student Registration
const documentTypes = {
    // COMPULSORY DOCUMENTS
    compulsory: [
        {
            id: 'passport_photo',
            name: 'Passport Size Photo',
            description: 'Recent passport size photograph (2x2 inches)',
            category: 'identity',
            isRequired: true,
            maxSize: '2MB',
            allowedFormats: ['jpg', 'jpeg', 'png'],
            validationRules: {
                minWidth: 200,
                minHeight: 200,
                maxWidth: 500,
                maxHeight: 500,
                aspectRatio: '1:1'
            },
            instructions: 'Photo should be clear, recent, and taken against a light background'
        },
        {
            id: 'aadhar_card',
            name: 'Aadhar Card',
            description: 'Front and back of Aadhar card',
            category: 'identity',
            isRequired: true,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            validationRules: {
                minPages: 1,
                maxPages: 2
            },
            instructions: 'Upload both front and back of Aadhar card in a single PDF or separate images'
        },
        {
            id: 'tenth_marksheet',
            name: '10th Marksheet cum Certificate',
            description: '10th standard marksheet and certificate (combined document)',
            category: 'academic',
            isRequired: true,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            validationRules: {
                minPages: 1,
                maxPages: 4
            },
            instructions: 'Upload the combined marksheet and certificate document. If separate, combine them into a single PDF',
            note: 'In some boards, marksheet and certificate are separate documents. Please combine them into one file if needed.'
        },
        {
            id: 'caste_certificate',
            name: 'Caste Certificate',
            description: 'Caste certificate (not older than 5 years)',
            category: 'category',
            isRequired: true,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            validationRules: {
                maxAge: 5, // years
                minPages: 1,
                maxPages: 3
            },
            instructions: 'Certificate should not be older than 5 years from the date of issue',
            validityCondition: 'Not older than 5 years'
        },
        {
            id: 'income_certificate',
            name: 'Income Certificate',
            description: 'Income certificate (not older than 1 year)',
            category: 'financial',
            isRequired: true,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            validationRules: {
                maxAge: 1, // year
                minPages: 1,
                maxPages: 3
            },
            instructions: 'Certificate should not be older than 1 year from the date of issue',
            validityCondition: 'Not older than 1 year'
        }
    ],

    // OPTIONAL DOCUMENTS
    optional: [
        {
            id: 'residence_certificate',
            name: 'Residence Certificate',
            description: 'Domicile/Residence certificate',
            category: 'identity',
            isRequired: false,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            validationRules: {
                minPages: 1,
                maxPages: 3
            },
            instructions: 'Optional document for residence proof'
        },
        {
            id: 'pm_kisan_enrollment',
            name: 'PM Kisan Enrollment Certificate',
            description: 'PM Kisan enrollment certificate for OBC free education',
            category: 'financial',
            isRequired: false,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            validationRules: {
                minPages: 1,
                maxPages: 3
            },
            instructions: 'Required for OBC students seeking free education under PM Kisan scheme',
            note: 'Check eligibility for PM Kisan scheme benefits'
        },
        {
            id: 'cm_kisan_enrollment',
            name: 'CM Kisan Enrollment Certificate',
            description: 'CM Kisan enrollment certificate for OBC free education',
            category: 'financial',
            isRequired: false,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            validationRules: {
                minPages: 1,
                maxPages: 3
            },
            instructions: 'Required for OBC students seeking free education under CM Kisan scheme',
            note: 'Check eligibility for CM Kisan scheme benefits'
        },
        {
            id: 'twelfth_marksheet',
            name: '12th Marksheet',
            description: '12th standard marksheet (if available)',
            category: 'academic',
            isRequired: false,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            validationRules: {
                minPages: 1,
                maxPages: 4
            },
            instructions: 'Upload if you have completed 12th standard'
        },
        {
            id: 'graduation_marksheet',
            name: 'Graduation Marksheet',
            description: 'Graduation marksheet (if available)',
            category: 'academic',
            isRequired: false,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            validationRules: {
                minPages: 1,
                maxPages: 4
            },
            instructions: 'Upload if you have completed graduation'
        }
    ],

    // CUSTOM DOCUMENTS
    custom: {
        enabled: true,
        maxCustomDocuments: 5,
        maxSize: '5MB',
        allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
        instructions: 'Upload any additional documents that might be relevant to your application'
    }
};

// Document Categories
const documentCategories = {
    identity: {
        name: 'Identity Documents',
        description: 'Documents for identity verification',
        color: 'blue',
        icon: 'id-card'
    },
    academic: {
        name: 'Academic Documents',
        description: 'Educational certificates and marksheets',
        color: 'green',
        icon: 'graduation-cap'
    },
    category: {
        name: 'Category Documents',
        description: 'Caste, category, and reservation certificates',
        color: 'purple',
        icon: 'certificate'
    },
    financial: {
        name: 'Financial Documents',
        description: 'Income and financial support certificates',
        color: 'yellow',
        icon: 'money-bill'
    }
};

// Validation Rules
const validationRules = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    minFileSize: 1024, // 1KB
    allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf'
    ],
    maxFilesPerDocument: 3,
    maxTotalFiles: 20
};

// Helper Functions
const getDocumentType = (id) => {
    const allDocuments = [...documentTypes.compulsory, ...documentTypes.optional];
    return allDocuments.find(doc => doc.id === id);
};

const getRequiredDocuments = () => {
    return documentTypes.compulsory;
};

const getOptionalDocuments = () => {
    return documentTypes.optional;
};

const getAllDocumentTypes = () => {
    return [...documentTypes.compulsory, ...documentTypes.optional];
};

const getDocumentCategories = () => {
    return documentCategories;
};

const validateDocument = (file, documentType) => {
    const docType = getDocumentType(documentType);
    if (!docType) return { valid: false, error: 'Invalid document type' };

    // Check file size
    if (file.size > (parseInt(docType.maxSize) * 1024 * 1024)) {
        return { valid: false, error: `File size exceeds ${docType.maxSize} limit` };
    }

    // Check file format
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!docType.allowedFormats.includes(fileExtension)) {
        return { valid: false, error: `File format not allowed. Allowed formats: ${docType.allowedFormats.join(', ')}` };
    }

    return { valid: true };
};

module.exports = {
    documentTypes,
    documentCategories,
    validationRules,
    getDocumentType,
    getRequiredDocuments,
    getOptionalDocuments,
    getAllDocumentTypes,
    getDocumentCategories,
    validateDocument
};
