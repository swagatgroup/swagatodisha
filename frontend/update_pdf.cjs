const fs = require('fs');

const codeToInsert = `
            // ==========================================
            // FETCH IMAGES ASYNC BEFORE PDF GENERATION
            // ==========================================
            let logoBase64 = null;
            try {
                const response = await fetch('/Swagat_Logo.png');
                const blob = await response.blob();
                logoBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch(e) { console.log('Logo load failed', e); }

            let photoBase64 = null;
            const photoUrl = formData?.documents?.passport_photo?.downloadUrl || formData?.documents?.passport_photo?.url;
            if (photoUrl) {
                try {
                    const response = await fetch(photoUrl);
                    const blob = await response.blob();
                    photoBase64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                } catch(e) { console.log('Photo load failed', e); }
            }

            // Generate premium PDF using jsPDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPosition = 0;

            pdf.setFont('times', 'normal');

            const drawPageBorders = (p) => {
                p.setDrawColor(25, 42, 86); // Navy blue
                p.setLineWidth(1.0);
                p.rect(10, 10, pageWidth - 20, pageHeight - 20);
                p.setLineWidth(0.3);
                p.rect(12, 12, pageWidth - 24, pageHeight - 24);
                
                // Add watermark
                if (logoBase64) {
                    p.setGState(new p.GState({opacity: 0.1}));
                    const wmSize = 120;
                    p.addImage(logoBase64, 'PNG', (pageWidth - wmSize)/2, (pageHeight - wmSize)/2, wmSize, wmSize);
                    p.setGState(new p.GState({opacity: 1.0}));
                }
            };
            drawPageBorders(pdf);

            // ============================================
            // HEADER
            // ============================================
            yPosition = 18;
            
            // Logo top left
            if (logoBase64) {
                pdf.addImage(logoBase64, 'PNG', 15, yPosition, 25, 25);
            }
            
            // Center Texts
            pdf.setTextColor(25, 42, 86);
            pdf.setFont('times', 'bold');
            pdf.setFontSize(24);
            pdf.text('SWAGAT ODISHA', pageWidth / 2, yPosition + 8, { align: 'center' });
            
            pdf.setFont('times', 'normal');
            pdf.setFontSize(12);
            pdf.text('Educational Excellence Platform', pageWidth / 2, yPosition + 15, { align: 'center' });
            pdf.text('www.swagatodisha.com', pageWidth / 2, yPosition + 21, { align: 'center' });
            
            yPosition += 32;
            
            // Admission Form Title
            pdf.setFont('times', 'bold');
            pdf.setFontSize(16);
            pdf.text('ADMISSION FORM', pageWidth / 2, yPosition, { align: 'center' });
            // Add underline to title
            const titleWidth = pdf.getTextWidth('ADMISSION FORM');
            pdf.setDrawColor(25, 42, 86);
            pdf.setLineWidth(0.5);
            pdf.line((pageWidth - titleWidth)/2, yPosition + 1.5, (pageWidth + titleWidth)/2, yPosition + 1.5);
            
            yPosition += 10;
            
            // Passport Photo top right
            const photoBoxWidth = 35;
            const photoBoxHeight = 45;
            const photoX = pageWidth - 15 - photoBoxWidth;
            const photoY = 18;
            
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.5);
            pdf.rect(photoX, photoY, photoBoxWidth, photoBoxHeight);
            if (photoBase64) {
                pdf.addImage(photoBase64, 'JPEG', photoX + 0.5, photoY + 0.5, photoBoxWidth - 1, photoBoxHeight - 1);
            } else {
                pdf.setFont('times', 'normal');
                pdf.setFontSize(9);
                pdf.text('Affix', photoX + photoBoxWidth/2, photoY + photoBoxHeight/2 - 2, { align: 'center' });
                pdf.text('Passport Photo', photoX + photoBoxWidth/2, photoY + photoBoxHeight/2 + 2, { align: 'center' });
            }

            // ============================================
            // BOXED FIELD HELPER
            // ============================================
            const drawBoxedField = (label, value, x, y, w, h = 8) => {
                pdf.setFont('times', 'normal');
                pdf.setFontSize(8);
                pdf.setTextColor(0, 0, 0);
                pdf.text(label, x, y - 1.5);
                
                pdf.setDrawColor(50, 50, 50);
                pdf.setLineWidth(0.3);
                pdf.setFillColor(255, 255, 255);
                // Draw box
                pdf.rect(x, y, w, h);
                
                pdf.setFont('times', 'bold');
                pdf.setFontSize(9);
                pdf.setTextColor(0, 0, 0);
                
                // Truncate if too long, or split
                const textStr = (value || 'N/A').toString();
                let textY = y + 5.5;
                const splitText = pdf.splitTextToSize(textStr, w - 4);
                
                if (splitText.length > 1 && h < 10) {
                    pdf.setFontSize(7);
                    pdf.text(splitText[0], x + 2, textY - 1);
                } else {
                    pdf.text(splitText[0] || '', x + 2, textY);
                }
            };
            
            // Layout Configuration
            const leftColX = 15;
            let currentY = yPosition + 5; // Starting below ADMISSION FORM
            
            // --------------------------------------------
            // Fields left of the photo (if overlapping)
            // --------------------------------------------
            const collegeName = pdfContent.courseDetails.selectedCollege 
                ? (colleges?.find(c => c._id === pdfContent.courseDetails.selectedCollege)?.name || 'N/A')
                : (pdfContent.courseDetails.institutionName || 'N/A');

            if (currentY < photoY + photoBoxHeight + 5) {
                // Fields to the left of the photo
                const leftWidth = pageWidth - 15 - photoBoxWidth - 20; // 20 spacing
                const halfWidth = (leftWidth - 5) / 2;
                
                drawBoxedField('Course', pdfContent.courseDetails.selectedCourse || pdfContent.courseDetails.courseName, leftColX, currentY, leftWidth);
                currentY += 12;
                
                drawBoxedField('College', collegeName, leftColX, currentY, leftWidth);
                currentY += 12;
                
                drawBoxedField('Stream', pdfContent.courseDetails.stream, leftColX, currentY, halfWidth);
                drawBoxedField('Session', pdfContent.applicationId ? "2024-2025" : "N/A", leftColX + halfWidth + 5, currentY, halfWidth);
                currentY += 12;
                
                // Make sure we clear the photo
                if (currentY < photoY + photoBoxHeight + 5) {
                    currentY = photoY + photoBoxHeight + 5;
                }
            } else {
                currentY = photoY + photoBoxHeight + 5;
            }
            
            // --------------------------------------------
            // Full Width Grid
            // --------------------------------------------
            const fullWidth = pageWidth - 30;
            const halfW = (fullWidth - 5) / 2;
            const thirdW = (fullWidth - 10) / 3;
            
            drawBoxedField('First Name', pdfContent.personalDetails.fullName, leftColX, currentY, halfW);
            drawBoxedField('Father/Husband Name', pdfContent.personalDetails.fathersName, leftColX + halfW + 5, currentY, halfW);
            currentY += 12;
            
            drawBoxedField('Aadhar Card No.', pdfContent.personalDetails.aadharNumber, leftColX, currentY, thirdW);
            drawBoxedField('Gender', pdfContent.personalDetails.gender, leftColX + thirdW + 5, currentY, thirdW);
            drawBoxedField('Birth Date', pdfContent.personalDetails.dateOfBirth, leftColX + (thirdW * 2) + 10, currentY, thirdW);
            currentY += 12;
            
            drawBoxedField('Category', pdfContent.personalDetails.category || pdfContent.personalDetails.status, leftColX, currentY, thirdW);
            drawBoxedField('Email Id', pdfContent.contactDetails.email, leftColX + thirdW + 5, currentY, thirdW * 2 + 5);
            currentY += 12;
            
            drawBoxedField('Primary Phone', pdfContent.contactDetails.primaryPhone, leftColX, currentY, thirdW);
            drawBoxedField('WhatsApp Number', pdfContent.contactDetails.whatsappNumber, leftColX + thirdW + 5, currentY, thirdW);
            drawBoxedField('Guardian Phone', pdfContent.guardianDetails.guardianPhone, leftColX + (thirdW * 2) + 10, currentY, thirdW);
            currentY += 15;
            
            // Address Blocks
            pdf.setFont('times', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(0,0,0);
            pdf.text('Correspondence Address:', leftColX, currentY);
            currentY += 4;
            
            drawBoxedField('Address Line 1', pdfContent.contactDetails.permanentAddress?.street, leftColX, currentY, halfW + thirdW);
            drawBoxedField('State', pdfContent.contactDetails.permanentAddress?.state, leftColX + halfW + thirdW + 5, currentY, fullWidth - (halfW + thirdW + 5));
            currentY += 12;
            
            drawBoxedField('City / District', (pdfContent.contactDetails.permanentAddress?.city || '') + ' / ' + (pdfContent.contactDetails.permanentAddress?.district || ''), leftColX, currentY, halfW);
            drawBoxedField('Pin Code', pdfContent.contactDetails.permanentAddress?.pincode, leftColX + halfW + 5, currentY, thirdW);
            drawBoxedField('Country', 'India', leftColX + halfW + thirdW + 10, currentY, fullWidth - (halfW + thirdW + 10));
            currentY += 15;
            
            // Previous Qualifications Table
            pdf.setFont('times', 'bold');
            pdf.setFontSize(10);
            pdf.text('Previous Qualification / Documents:', leftColX, currentY);
            currentY += 4;
            
            const docs = Object.entries(pdfContent.documents || {});
            if (docs.length > 0) {
                let docX = leftColX;
                let docY = currentY;
                const docBoxW = (fullWidth - 15) / 4;
                
                const documentNames = {
                    'passport_photo': 'Passport Photo',
                    'aadhar_card': 'Aadhar Card',
                    'marksheet_10th': '10th Marksheet',
                    'tenth_marksheet_certificate': '10th Cert',
                    'marksheet_12th': '12th Marksheet',
                    'transfer_certificate': 'Transfer Cert',
                    'caste_certificate': 'Caste Cert',
                    'income_certificate': 'Income Cert'
                };

                docs.forEach(([k, docItem], i) => {
                    if (i > 0 && i % 4 === 0) {
                        docX = leftColX;
                        docY += 12;
                    }
                    drawBoxedField('Uploaded Document', documentNames[k] || k.replace(/_/g, ' '), docX, docY, docBoxW);
                    docX += docBoxW + 5;
                });
                currentY = docY + 16;
            } else {
                pdf.setFont('times', 'normal');
                pdf.setFontSize(9);
                pdf.text('No documents uploaded', leftColX, currentY + 4);
                currentY += 12;
            }

            // Declaration box at bottom
            currentY = pageHeight - 55;
            
            pdf.setFont('times', 'bold');
            pdf.setFontSize(14);
            pdf.text('\u2611', leftColX, currentY); // Checkbox
            
            pdf.setFont('times', 'normal');
            pdf.setFontSize(8);
            const declarationText = "I hereby declared that information provided above is true and complete to the best of my knowledge and belief and my admission may be cancelled at any state if it is found to be incorrect. I also undertake to abide by all the rules and regulations of the university from time to time.";
            const decLines = pdf.splitTextToSize(declarationText, fullWidth - 10);
            pdf.text(decLines, leftColX + 5, currentY - 2);
            
            // Signatures
            currentY = pageHeight - 25;
            pdf.setFont('times', 'bold');
            pdf.setFontSize(10);
            pdf.text("Student's Signature", pageWidth - 15, currentY, { align: 'right' });
`;

const path = 'C:\\\\Users\\\\Dell\\\\Desktop\\\\swagatodisha\\\\frontend\\\\src\\\\components\\\\forms\\\\ApplicationPDFGenerator.jsx';
const content = fs.readFileSync(path, 'utf8');

const startIdx = content.indexOf("const pdf = new jsPDF('p', 'mm', 'a4');");
const endIdx = content.indexOf("const totalPagesCount = Math.min(pdf.internal.getNumberOfPages(), 2);");

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find start or end index.");
    process.exit(1);
}

const newContent = content.substring(0, startIdx) + codeToInsert.trim() + "\n\n            " + content.substring(endIdx);

fs.writeFileSync(path, newContent);
console.log("Successfully updated PDF generation logic!");
