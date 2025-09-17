const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
    constructor() {
        this.doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            compress: true
        });
    }

    generateApplicationPDF(formData, termsAndConditions) {
        const buffers = [];
        this.doc.on('data', buffers.push.bind(buffers));

        return new Promise((resolve, reject) => {
            this.doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            try {
                this.generateHeader();
                this.generatePersonalDetails(formData.personalDetails);
                this.generateContactDetails(formData.contactDetails);
                this.generateCourseDetails(formData.courseDetails);
                this.generateGuardianDetails(formData.guardianDetails);
                this.generateDocumentsList(formData.documents);
                this.generateTermsAndConditions(termsAndConditions);
                this.generateFooter();

                this.doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    generateHeader() {
        // Header with logo and title
        this.doc.rect(0, 0, 595, 100)
            .fill('#1e40af'); // Blue background

        // Title
        this.doc.fillColor('white')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('SWAGAT GROUP OF INSTITUTIONS', 50, 30, { align: 'center' });

        this.doc.fontSize(14)
            .text('Student Application Form', 50, 60, { align: 'center' });

        // Application ID and Date
        this.doc.fontSize(10)
            .text(`Application ID: ${Date.now().toString().slice(-8)}`, 50, 80)
            .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 450, 80);

        // Move to content area
        this.doc.y = 120;
    }

    generatePersonalDetails(personalDetails) {
        this.doc.fillColor('#1e40af')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('1. PERSONAL DETAILS', 50, this.doc.y + 10);

        this.doc.strokeColor('#e5e7eb')
            .lineWidth(1)
            .moveTo(50, this.doc.y + 5)
            .lineTo(545, this.doc.y + 5)
            .stroke();

        this.doc.y += 20;

        // Personal details in a table format
        const personalData = [
            ['Full Name', personalDetails.fullName || 'N/A'],
            ['Father\'s Name', personalDetails.fathersName || 'N/A'],
            ['Mother\'s Name', personalDetails.mothersName || 'N/A'],
            ['Date of Birth', personalDetails.dateOfBirth || 'N/A'],
            ['Gender', personalDetails.gender || 'N/A'],
            ['Aadhaar Number', personalDetails.aadharNumber || 'N/A']
        ];

        this.generateTable(personalData, 50, this.doc.y);
        this.doc.y += 20;
    }

    generateContactDetails(contactDetails) {
        this.doc.fillColor('#1e40af')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('2. CONTACT DETAILS', 50, this.doc.y + 10);

        this.doc.strokeColor('#e5e7eb')
            .lineWidth(1)
            .moveTo(50, this.doc.y + 5)
            .lineTo(545, this.doc.y + 5)
            .stroke();

        this.doc.y += 20;

        const contactData = [
            ['Primary Phone', contactDetails.primaryPhone || 'N/A'],
            ['WhatsApp Number', contactDetails.whatsappNumber || 'N/A'],
            ['Email Address', contactDetails.email || 'N/A'],
            ['Street Address', contactDetails.permanentAddress?.street || 'N/A'],
            ['City', contactDetails.permanentAddress?.city || 'N/A'],
            ['State', contactDetails.permanentAddress?.state || 'N/A'],
            ['Pincode', contactDetails.permanentAddress?.pincode || 'N/A'],
            ['Country', contactDetails.permanentAddress?.country || 'N/A']
        ];

        this.generateTable(contactData, 50, this.doc.y);
        this.doc.y += 20;
    }

    generateCourseDetails(courseDetails) {
        this.doc.fillColor('#1e40af')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('3. COURSE DETAILS', 50, this.doc.y + 10);

        this.doc.strokeColor('#e5e7eb')
            .lineWidth(1)
            .moveTo(50, this.doc.y + 5)
            .lineTo(545, this.doc.y + 5)
            .stroke();

        this.doc.y += 20;

        const courseData = [
            ['Selected Course', courseDetails.selectedCourse || 'N/A'],
            ['Custom Course', courseDetails.customCourse || 'N/A'],
            ['Stream/Subject', courseDetails.stream || 'N/A'],
            ['Campus', courseDetails.campus || 'N/A'],
            ['Referral Code', courseDetails.referralCode || 'N/A']
        ];

        this.generateTable(courseData, 50, this.doc.y);
        this.doc.y += 20;
    }

    generateGuardianDetails(guardianDetails) {
        this.doc.fillColor('#1e40af')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('4. GUARDIAN DETAILS', 50, this.doc.y + 10);

        this.doc.strokeColor('#e5e7eb')
            .lineWidth(1)
            .moveTo(50, this.doc.y + 5)
            .lineTo(545, this.doc.y + 5)
            .stroke();

        this.doc.y += 20;

        const guardianData = [
            ['Guardian Name', guardianDetails.guardianName || 'N/A'],
            ['Relationship', guardianDetails.relationship || 'N/A'],
            ['Guardian Phone', guardianDetails.guardianPhone || 'N/A'],
            ['Guardian Email', guardianDetails.guardianEmail || 'N/A']
        ];

        this.generateTable(guardianData, 50, this.doc.y);
        this.doc.y += 20;
    }

    generateDocumentsList(documents) {
        this.doc.fillColor('#1e40af')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('5. UPLOADED DOCUMENTS', 50, this.doc.y + 10);

        this.doc.strokeColor('#e5e7eb')
            .lineWidth(1)
            .moveTo(50, this.doc.y + 5)
            .lineTo(545, this.doc.y + 5)
            .stroke();

        this.doc.y += 20;

        if (documents && documents.length > 0) {
            documents.forEach((doc, index) => {
                this.doc.fillColor('#374151')
                    .fontSize(12)
                    .font('Helvetica')
                    .text(`${index + 1}. ${doc.name || 'Document'}`, 50, this.doc.y);
                this.doc.y += 15;
            });
        } else {
            this.doc.fillColor('#6b7280')
                .fontSize(12)
                .font('Helvetica')
                .text('No documents uploaded', 50, this.doc.y);
            this.doc.y += 15;
        }

        this.doc.y += 10;
    }

    generateTermsAndConditions(termsAndConditions) {
        // Check if we need a new page
        if (this.doc.y > 700) {
            this.doc.addPage();
        }

        this.doc.fillColor('#1e40af')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('6. TERMS AND CONDITIONS', 50, this.doc.y + 10);

        this.doc.strokeColor('#e5e7eb')
            .lineWidth(1)
            .moveTo(50, this.doc.y + 5)
            .lineTo(545, this.doc.y + 5)
            .stroke();

        this.doc.y += 20;

        // Terms and conditions content
        const terms = termsAndConditions || this.getDefaultTerms();

        this.doc.fillColor('#374151')
            .fontSize(10)
            .font('Helvetica')
            .text(terms, 50, this.doc.y, {
                width: 495,
                align: 'justify',
                lineGap: 3
            });

        this.doc.y += 30;

        // Signature section
        this.doc.fillColor('#1e40af')
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('DECLARATION', 50, this.doc.y);

        this.doc.y += 10;

        this.doc.fillColor('#374151')
            .fontSize(10)
            .font('Helvetica')
            .text('I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that any false information may result in the rejection of my application.', 50, this.doc.y, {
                width: 495,
                align: 'justify'
            });

        this.doc.y += 30;

        // Signature lines
        this.doc.strokeColor('#000000')
            .lineWidth(1)
            .moveTo(50, this.doc.y)
            .lineTo(200, this.doc.y)
            .stroke();

        this.doc.fillColor('#374151')
            .fontSize(10)
            .font('Helvetica')
            .text('Student Signature', 50, this.doc.y + 5);

        this.doc.strokeColor('#000000')
            .lineWidth(1)
            .moveTo(350, this.doc.y - 5)
            .lineTo(500, this.doc.y - 5)
            .stroke();

        this.doc.fillColor('#374151')
            .fontSize(10)
            .font('Helvetica')
            .text('Date', 350, this.doc.y);

        this.doc.y += 30;

        this.doc.strokeColor('#000000')
            .lineWidth(1)
            .moveTo(50, this.doc.y)
            .lineTo(200, this.doc.y)
            .stroke();

        this.doc.fillColor('#374151')
            .fontSize(10)
            .font('Helvetica')
            .text('Parent/Guardian Signature', 50, this.doc.y + 5);

        this.doc.strokeColor('#000000')
            .lineWidth(1)
            .moveTo(350, this.doc.y - 5)
            .lineTo(500, this.doc.y - 5)
            .stroke();

        this.doc.fillColor('#374151')
            .fontSize(10)
            .font('Helvetica')
            .text('Date', 350, this.doc.y);
    }

    generateTable(data, x, y) {
        const rowHeight = 20;
        const col1Width = 150;
        const col2Width = 345;

        data.forEach((row, index) => {
            const currentY = y + (index * rowHeight);

            // Draw cell borders
            this.doc.rect(x, currentY, col1Width, rowHeight)
                .fill('#f8fafc')
                .stroke('#e5e7eb');

            this.doc.rect(x + col1Width, currentY, col2Width, rowHeight)
                .fill('#ffffff')
                .stroke('#e5e7eb');

            // Add text
            this.doc.fillColor('#374151')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text(row[0], x + 5, currentY + 5, { width: col1Width - 10 });

            this.doc.fillColor('#6b7280')
                .fontSize(10)
                .font('Helvetica')
                .text(row[1], x + col1Width + 5, currentY + 5, { width: col2Width - 10 });
        });

        this.doc.y = y + (data.length * rowHeight) + 10;
    }

    generateFooter() {
        const pageHeight = this.doc.page.height;

        this.doc.fillColor('#f3f4f6')
            .rect(0, pageHeight - 50, 595, 50)
            .fill();

        this.doc.fillColor('#6b7280')
            .fontSize(8)
            .font('Helvetica')
            .text('This document is computer generated and does not require a signature.', 50, pageHeight - 35, { align: 'center' });

        this.doc.text('© 2024 Swagat Group of Institutions. All rights reserved.', 50, pageHeight - 20, { align: 'center' });
    }

    getDefaultTerms() {
        return `
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
        `;
    }
}

module.exports = PDFGenerator;
