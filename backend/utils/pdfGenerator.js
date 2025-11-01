const PDFDocument = require('pdfkit');
const { PDFDocument: PDFLib } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { promisify } = require('util');
const https = require('https');
const http = require('http');
const sharp = require('sharp');

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

    async generateCombinedPDF(application, selectedDocuments = []) {
        try {
            const fileName = `application_${application.applicationId}_combined_${Date.now()}.pdf`;
            const filePath = path.join(this.outputDir, fileName);

            // Create a new PDF document using pdf-lib for merging
            const mergedPdf = await PDFLib.create();

            // Helper function to download file
            const downloadFile = (url) => {
                return new Promise((resolve, reject) => {
                    const protocol = url.startsWith('https') ? https : http;
                    protocol.get(url, (res) => {
                        const chunks = [];
                        res.on('data', (chunk) => chunks.push(chunk));
                        res.on('end', () => resolve(Buffer.concat(chunks)));
                        res.on('error', reject);
                    }).on('error', reject);
                });
            };

            // Helper function to convert image to PDF bytes
            const imageToPdf = async (imageBuffer, imageType) => {
                const pdfDoc = await PDFLib.create();
                const page = pdfDoc.addPage([612, 792]); // Letter size

                let image;
                if (imageType === 'image/jpeg' || imageType === 'image/jpg') {
                    image = await pdfDoc.embedJpg(imageBuffer);
                } else if (imageType === 'image/png') {
                    image = await pdfDoc.embedPng(imageBuffer);
                } else {
                    throw new Error(`Unsupported image type: ${imageType}`);
                }

                // Scale image to fit page while maintaining aspect ratio
                const { width, height } = image.scale(1);
                const pageWidth = page.getWidth();
                const pageHeight = page.getHeight();
                const scaleX = pageWidth / width;
                const scaleY = pageHeight / height;
                const scale = Math.min(scaleX, scaleY);
                const scaledWidth = width * scale;
                const scaledHeight = height * scale;
                const x = (pageWidth - scaledWidth) / 2;
                const y = (pageHeight - scaledHeight) / 2;

                page.drawImage(image, {
                    x,
                    y,
                    width: scaledWidth,
                    height: scaledHeight,
                });

                return await pdfDoc.save();
            };

            // Process each selected document
            for (const doc of selectedDocuments) {
                try {
                    const docUrl = doc.filePath || doc.url || doc.downloadUrl;
                    if (!docUrl) {
                        console.warn(`Document ${doc.documentType} has no URL, skipping`);
                        continue;
                    }

                    // Get full URL
                    const fullUrl = docUrl.startsWith('http') ? docUrl :
                        docUrl.startsWith('/') ? `${process.env.BASE_URL || 'http://localhost:5000'}${docUrl}` :
                            `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${docUrl}`;

                    console.log(`Processing document: ${doc.documentType} from ${fullUrl}`);

                    // Download the document
                    const fileBuffer = await downloadFile(fullUrl);
                    const mimeType = doc.mimeType || doc.type || 'application/pdf';

                    if (mimeType === 'application/pdf') {
                        // Embed PDF directly
                        const pdfBytes = await PDFLib.load(fileBuffer);
                        const pages = await mergedPdf.copyPages(pdfBytes, pdfBytes.getPageIndices());
                        pages.forEach(page => mergedPdf.addPage(page));
                    } else if (mimeType.startsWith('image/')) {
                        // Convert image to PDF and embed
                        const imagePdfBytes = await imageToPdf(fileBuffer, mimeType);
                        const imagePdf = await PDFLib.load(imagePdfBytes);
                        const pages = await mergedPdf.copyPages(imagePdf, imagePdf.getPageIndices());
                        pages.forEach(page => mergedPdf.addPage(page));
                    } else {
                        console.warn(`Unsupported file type for ${doc.documentType}: ${mimeType}, skipping`);
                    }
                } catch (docError) {
                    console.error(`Error processing document ${doc.documentType}:`, docError);
                    // Continue with other documents instead of failing completely
                }
            }

            // Save merged PDF
            const pdfBytes = await mergedPdf.save();
            fs.writeFileSync(filePath, pdfBytes);

            return {
                fileName,
                filePath,
                url: `/api/files/download/${fileName}`
            };

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

    async generateDocumentsZIP(application, selectedDocuments = []) {
        try {
            const fileName = `application_${application.applicationId}_documents_${Date.now()}.zip`;
            const filePath = path.join(this.outputDir, fileName);

            const output = fs.createWriteStream(filePath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            // Helper function to download file
            const downloadFile = (url) => {
                return new Promise((resolve, reject) => {
                    const protocol = url.startsWith('https') ? https : http;
                    protocol.get(url, (res) => {
                        const chunks = [];
                        res.on('data', (chunk) => chunks.push(chunk));
                        res.on('end', () => resolve(Buffer.concat(chunks)));
                        res.on('error', reject);
                    }).on('error', reject);
                });
            };

            return new Promise(async (resolve, reject) => {
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

                // Process each selected document
                for (const doc of selectedDocuments) {
                    try {
                        const docUrl = doc.filePath || doc.url || doc.downloadUrl;
                        if (!docUrl) {
                            console.warn(`Document ${doc.documentType} has no URL, skipping`);
                            continue;
                        }

                        // Get full URL
                        const fullUrl = docUrl.startsWith('http') ? docUrl :
                            docUrl.startsWith('/') ? `${process.env.BASE_URL || 'http://localhost:5000'}${docUrl}` :
                                `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${docUrl}`;

                        console.log(`Adding to ZIP: ${doc.documentType} from ${fullUrl}`);

                        // Download the document
                        const fileBuffer = await downloadFile(fullUrl);

                        // Get file extension from mime type or filename
                        const mimeType = doc.mimeType || doc.type || 'application/pdf';
                        let ext = 'pdf';
                        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
                        else if (mimeType.includes('png')) ext = 'png';
                        else if (mimeType.includes('pdf')) ext = 'pdf';

                        const safeDocType = (doc.documentType || 'document').replace(/[^a-zA-Z0-9]/g, '_');
                        const zipFileName = `${safeDocType}_${application.applicationId}.${ext}`;

                        archive.append(fileBuffer, { name: zipFileName });
                    } catch (docError) {
                        console.error(`Error adding document ${doc.documentType} to ZIP:`, docError);
                        // Continue with other documents
                    }
                }

                // Add application PDF if exists
                if (application.applicationPdfUrl) {
                    try {
                        const appPdfUrl = application.applicationPdfUrl.startsWith('http')
                            ? application.applicationPdfUrl
                            : `${process.env.BASE_URL || 'http://localhost:5000'}${application.applicationPdfUrl}`;
                        const pdfBuffer = await downloadFile(appPdfUrl);
                        archive.append(pdfBuffer, { name: `application_${application.applicationId}.pdf` });
                    } catch (err) {
                        console.warn('Could not add application PDF to ZIP:', err);
                    }
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