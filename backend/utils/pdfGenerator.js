const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { promisify } = require('util');

class PDFGenerator {
    constructor() {
        this.outputDir = path.join(__dirname, '../uploads/processed');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async generateCombinedPDF(application) {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const fileName = `application_${application.applicationId}_combined.pdf`;
            const filePath = path.join(this.outputDir, fileName);

            // Create write stream
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Add application header
            this.addApplicationHeader(doc, application);

            // Add personal details
            this.addPersonalDetails(doc, application);

            // Add academic details
            this.addAcademicDetails(doc, application);

            // Add guardian details
            this.addGuardianDetails(doc, application);

            // Add financial details
            this.addFinancialDetails(doc, application);

            // Add documents section
            this.addDocumentsSection(doc, application);

            // Add terms and conditions
            this.addTermsAndConditions(doc);

            // Finalize PDF
            doc.end();

            return new Promise((resolve, reject) => {
                stream.on('finish', () => {
                    resolve({
                        fileName,
                        filePath,
                        url: `/api/files/download/${fileName}`
                    });
                });
                stream.on('error', reject);
            });

        } catch (error) {
            console.error('Error generating combined PDF:', error);
            throw error;
        }
    }

    addApplicationHeader(doc, application) {
        // Title
        doc.fontSize(24)
            .font('Helvetica-Bold')
            .fillColor('#1f2937')
            .text('Student Application Form', 50, 50, { align: 'center' });

        // Application ID
        doc.fontSize(14)
            .font('Helvetica')
            .fillColor('#6b7280')
            .text(`Application ID: ${application.applicationId}`, 50, 100, { align: 'center' });

        // Status
        doc.fontSize(12)
            .fillColor(application.status === 'APPROVED' ? '#10b981' : '#f59e0b')
            .text(`Status: ${application.status}`, 50, 120, { align: 'center' });

        // Date
        doc.fontSize(10)
            .fillColor('#6b7280')
            .text(`Submitted: ${new Date(application.submittedAt).toLocaleDateString()}`, 50, 140, { align: 'center' });

        doc.moveDown(2);
    }

    addPersonalDetails(doc, application) {
        const personalDetails = application.personalDetails || {};

        doc.fontSize(16)
            .font('Helvetica-Bold')
            .fillColor('#1f2937')
            .text('Personal Details', 50, doc.y);

        doc.moveDown(0.5);

        const personalFields = [
            { label: 'Full Name', value: personalDetails.fullName || 'N/A' },
            { label: 'Email', value: personalDetails.email || 'N/A' },
            { label: 'Phone Number', value: personalDetails.phoneNumber || 'N/A' },
            { label: 'Date of Birth', value: personalDetails.dateOfBirth ? new Date(personalDetails.dateOfBirth).toLocaleDateString() : 'N/A' },
            { label: 'Gender', value: personalDetails.gender || 'N/A' },
            { label: 'Aadhar Number', value: personalDetails.aadharNumber || 'N/A' },
            { label: 'Address', value: personalDetails.address || 'N/A' }
        ];

        this.addFieldList(doc, personalFields);
    }

    addAcademicDetails(doc, application) {
        const academicDetails = application.academicDetails || {};

        doc.addPage();
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .fillColor('#1f2937')
            .text('Academic Details', 50, 50);

        doc.moveDown(0.5);

        const academicFields = [
            { label: 'Course Name', value: academicDetails.courseName || 'N/A' },
            { label: 'Previous Institution', value: academicDetails.previousInstitution || 'N/A' },
            { label: 'Previous Course', value: academicDetails.previousCourse || 'N/A' },
            { label: 'Year of Passing', value: academicDetails.yearOfPassing || 'N/A' },
            { label: 'Percentage/CGPA', value: academicDetails.percentage || 'N/A' }
        ];

        this.addFieldList(doc, academicFields);
    }

    addGuardianDetails(doc, application) {
        const guardianDetails = application.guardianDetails || {};

        doc.fontSize(16)
            .font('Helvetica-Bold')
            .fillColor('#1f2937')
            .text('Guardian Details', 50, doc.y + 20);

        doc.moveDown(0.5);

        const guardianFields = [
            { label: 'Guardian Name', value: guardianDetails.guardianName || 'N/A' },
            { label: 'Guardian Phone', value: guardianDetails.guardianPhone || 'N/A' },
            { label: 'Guardian Email', value: guardianDetails.guardianEmail || 'N/A' },
            { label: 'Relationship', value: guardianDetails.relationship || 'N/A' },
            { label: 'Guardian Address', value: guardianDetails.guardianAddress || 'N/A' }
        ];

        this.addFieldList(doc, guardianFields);
    }

    addFinancialDetails(doc, application) {
        const financialDetails = application.financialDetails || {};

        doc.fontSize(16)
            .font('Helvetica-Bold')
            .fillColor('#1f2937')
            .text('Financial Details', 50, doc.y + 20);

        doc.moveDown(0.5);

        const financialFields = [
            { label: 'Annual Income', value: financialDetails.annualIncome || 'N/A' },
            { label: 'Payment Method', value: financialDetails.paymentMethod || 'N/A' },
            { label: 'Scholarship Applied', value: financialDetails.scholarshipApplied ? 'Yes' : 'No' },
            { label: 'Scholarship Details', value: financialDetails.scholarshipDetails || 'N/A' }
        ];

        this.addFieldList(doc, financialFields);
    }

    addDocumentsSection(doc, application) {
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .fillColor('#1f2937')
            .text('Uploaded Documents', 50, doc.y + 20);

        doc.moveDown(0.5);

        const documents = application.documents || {};
        const documentList = [
            { name: 'Aadhar Card', status: documents.aadharCard ? 'Uploaded' : 'Not Uploaded' },
            { name: 'Passport Photo', status: documents.passportPhoto ? 'Uploaded' : 'Not Uploaded' },
            { name: '10th Marksheet', status: documents.tenthMarksheet ? 'Uploaded' : 'Not Uploaded' },
            { name: '12th Marksheet', status: documents.twelfthMarksheet ? 'Uploaded' : 'Not Uploaded' },
            { name: 'Migration Certificate', status: documents.migrationCertificate ? 'Uploaded' : 'Not Uploaded' },
            { name: 'Character Certificate', status: documents.characterCertificate ? 'Uploaded' : 'Not Uploaded' }
        ];

        documentList.forEach(docItem => {
            doc.fontSize(12)
                .font('Helvetica')
                .fillColor('#374151')
                .text(`• ${docItem.name}: `, 70, doc.y);

            doc.fillColor(docItem.status === 'Uploaded' ? '#10b981' : '#ef4444')
                .text(docItem.status, doc.x, doc.y);

            doc.moveDown(0.3);
        });
    }

    addTermsAndConditions(doc) {
        doc.addPage();
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .fillColor('#1f2937')
            .text('Terms and Conditions', 50, 50);

        doc.moveDown(0.5);

        const terms = [
            '1. All information provided in this application is true and accurate to the best of my knowledge.',
            '2. I understand that providing false information may result in rejection of my application.',
            '3. I agree to abide by the rules and regulations of the institution.',
            '4. I understand that the institution reserves the right to verify all submitted documents.',
            '5. I consent to the processing of my personal data for admission purposes.',
            '6. I understand that admission is subject to availability of seats and meeting eligibility criteria.',
            '7. I agree to pay all applicable fees as per the institution\'s fee structure.',
            '8. I understand that this application does not guarantee admission.'
        ];

        terms.forEach(term => {
            doc.fontSize(10)
                .font('Helvetica')
                .fillColor('#374151')
                .text(term, 50, doc.y, { width: 500 });
            doc.moveDown(0.3);
        });

        // Signature section
        doc.moveDown(2);
        doc.text('Student Signature: _________________', 50, doc.y);
        doc.text('Date: _________________', 300, doc.y);
        doc.moveDown(1);
        doc.text('Guardian Signature: _________________', 50, doc.y);
        doc.text('Date: _________________', 300, doc.y);
    }

    addFieldList(doc, fields) {
        fields.forEach(field => {
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#374151')
                .text(`${field.label}:`, 70, doc.y);

            doc.font('Helvetica')
                .fillColor('#6b7280')
                .text(field.value, 200, doc.y);

            doc.moveDown(0.4);
        });
    }

    async generateDocumentsZIP(application) {
        try {
            const fileName = `application_${application.applicationId}_documents.zip`;
            const filePath = path.join(this.outputDir, fileName);

            const output = fs.createWriteStream(filePath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            return new Promise((resolve, reject) => {
                output.on('close', () => {
                    resolve({
                        fileName,
                        filePath,
                        url: `/api/files/download/${fileName}`,
                        size: archive.pointer()
                    });
                });

                archive.on('error', reject);
                archive.pipe(output);

                // Add individual documents
                const documents = application.documents || {};
                Object.entries(documents).forEach(([key, doc]) => {
                    if (doc && doc.url) {
                        const fileName = `${key}_${application.applicationId}.${doc.fileType || 'pdf'}`;
                        archive.file(doc.url, { name: fileName });
                    }
                });

                // Add application PDF if exists
                if (application.applicationPdfUrl) {
                    archive.file(application.applicationPdfUrl, { name: `application_${application.applicationId}.pdf` });
                }

                archive.finalize();
            });

        } catch (error) {
            console.error('Error generating documents ZIP:', error);
            throw error;
        }
    }
}

module.exports = new PDFGenerator();