const PDFGenerator = require('../utils/pdfGenerator');
const StudentApplication = require('../models/StudentApplication');
const fs = require('fs');
const path = require('path');

// Generate PDF for student application
const generateApplicationPDF = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { termsAndConditions } = req.body;

        // Get application data
        const application = await StudentApplication.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Create PDF generator instance
        const pdfGenerator = new PDFGenerator();

        // Generate PDF
        const pdfBuffer = await pdfGenerator.generateApplicationPDF(
            application.data || application,
            termsAndConditions
        );

        // Update application with PDF generated status
        application.pdfGenerated = true;
        application.pdfGeneratedAt = new Date();
        await application.save();

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="application_${applicationId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF buffer
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Generate PDF for preview (without saving)
const generatePreviewPDF = async (req, res) => {
    try {
        const { formData, termsAndConditions } = req.body;

        if (!formData) {
            return res.status(400).json({
                success: false,
                message: 'Form data is required'
            });
        }

        // Create PDF generator instance
        const pdfGenerator = new PDFGenerator();

        // Generate PDF
        const pdfBuffer = await pdfGenerator.generateApplicationPDF(
            formData,
            termsAndConditions
        );

        // Set response headers for PDF preview
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="application_preview.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF buffer
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF preview generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF preview',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get PDF download link
const getPDFDownloadLink = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (!application.pdfGenerated) {
            return res.status(400).json({
                success: false,
                message: 'PDF not generated yet. Please generate PDF first.'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                downloadUrl: `/api/pdf/download/${applicationId}`,
                generatedAt: application.pdfGeneratedAt
            }
        });

    } catch (error) {
        console.error('Get PDF download link error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get PDF download link',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Download existing PDF
const downloadPDF = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (!application.pdfGenerated) {
            return res.status(400).json({
                success: false,
                message: 'PDF not generated yet. Please generate PDF first.'
            });
        }

        // Generate fresh PDF for download
        const pdfGenerator = new PDFGenerator();
        const pdfBuffer = await pdfGenerator.generateApplicationPDF(
            application.data || application,
            application.termsAndConditions
        );

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="application_${applicationId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF buffer
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF download error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get terms and conditions
const getTermsAndConditions = async (req, res) => {
    try {
        const termsAndConditions = {
            title: "Terms and Conditions",
            content: `
1. ELIGIBILITY: The applicant must meet all the eligibility criteria as specified for the chosen course.

2. DOCUMENTATION: All required documents must be submitted in original or certified copies. Any false or misleading information will result in immediate rejection.

3. ADMISSION PROCESS: Admission is subject to verification of documents, payment of fees, and availability of seats. The institution reserves the right to reject any application without assigning reasons.

4. FEE STRUCTURE: The fee structure is as per the current academic year. Fees are subject to revision as per institutional policy. All fees must be paid within the stipulated time.

5. REFUND POLICY: Refund of fees will be as per the institutional refund policy. No refund will be made after the commencement of classes.

6. CODE OF CONDUCT: Students must adhere to the institutional code of conduct and disciplinary rules. Violation may result in disciplinary action including expulsion.

7. ATTENDANCE: Minimum 75% attendance is mandatory for all courses. Students failing to meet attendance requirements may not be allowed to appear for examinations.

8. EXAMINATION: Students must appear for all examinations as per the academic calendar. Malpractice in examinations will result in severe disciplinary action.

9. CERTIFICATE: Certificates will be issued only after successful completion of the course and fulfillment of all academic requirements.

10. AMENDMENTS: The institution reserves the right to amend these terms and conditions at any time. Students will be informed of any changes.

11. JURISDICTION: All disputes will be subject to the jurisdiction of the courts in Odisha, India.

12. FORCE MAJEURE: The institution shall not be liable for any delay or failure in performance due to circumstances beyond its control.

By signing this application, I acknowledge that I have read, understood, and agree to abide by all the terms and conditions mentioned above.
            `
        };

        res.status(200).json({
            success: true,
            data: termsAndConditions
        });

    } catch (error) {
        console.error('Get terms and conditions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get terms and conditions',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    generateApplicationPDF,
    generatePreviewPDF,
    getPDFDownloadLink,
    downloadPDF,
    getTermsAndConditions
};
