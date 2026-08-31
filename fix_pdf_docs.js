const fs = require('fs');
const filePath = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/forms/ApplicationPDFGenerator.jsx';

let content = fs.readFileSync(filePath, 'utf8');

const oldCode = `            const docs = Object.entries(pdfContent.documents || {});
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
                        docY += 16;
                    }
                    
                    // Draw box
                    pdf.setFillColor(255, 255, 255);
                    pdf.setDrawColor(50, 50, 50);
                    pdf.setLineWidth(0.3);
                    pdf.rect(docX, docY, docBoxW, 10, 'FD');
                    
                    // Label
                    pdf.setFont('times', 'bold');
                    pdf.setFontSize(8);
                    pdf.setTextColor(25, 42, 86);
                    pdf.text(documentNames[k] || k.replace(/_/g, ' '), docX + 1, docY - 1);
                    
                    // Link
                    if (docItem && docItem.downloadUrl) {
                        pdf.setFont('times', 'bold');
                        pdf.setFontSize(9);
                        pdf.setTextColor(0, 102, 204); // Blue color for link
                        pdf.textWithLink('View Document', docX + 2, docY + 6, { url: docItem.downloadUrl });
                    } else {
                        pdf.setFont('times', 'normal');
                        pdf.setFontSize(9);
                        pdf.setTextColor(150, 150, 150);
                        pdf.text('Not Uploaded', docX + 2, docY + 6);
                    }
                    
                    docX += docBoxW + 5;
                });
                currentY = docY + 24;
            }`;

const newCode = `            let docsArray = [];
            if (Array.isArray(pdfContent.documents)) {
                docsArray = pdfContent.documents;
            } else if (pdfContent.documents && typeof pdfContent.documents === 'object') {
                docsArray = Object.entries(pdfContent.documents).map(([k, v]) => ({
                    documentType: k,
                    ...v
                }));
            }

            if (docsArray.length > 0) {
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

                docsArray.forEach((docItem, i) => {
                    if (i > 0 && i % 4 === 0) {
                        docX = leftColX;
                        docY += 16;
                    }
                    
                    // Draw box
                    pdf.setFillColor(255, 255, 255);
                    pdf.setDrawColor(50, 50, 50);
                    pdf.setLineWidth(0.3);
                    pdf.rect(docX, docY, docBoxW, 10, 'FD');
                    
                    // Label
                    pdf.setFont('times', 'bold');
                    pdf.setFontSize(8);
                    pdf.setTextColor(25, 42, 86);
                    const docType = docItem.documentType || docItem.fileName || 'Document ' + i;
                    const docNameDisplay = documentNames[docType] || docType.replace(/_/g, ' ');
                    
                    // Truncate label if too long
                    const truncatedLabel = docNameDisplay.length > 20 ? docNameDisplay.substring(0, 18) + '...' : docNameDisplay;
                    pdf.text(truncatedLabel, docX + 1, docY - 1);
                    
                    // Link
                    const docUrl = docItem.filePath || docItem.downloadUrl || docItem.url;
                    
                    if (docUrl) {
                        pdf.setFont('times', 'bold');
                        pdf.setFontSize(9);
                        pdf.setTextColor(0, 102, 204); // Blue color for link
                        pdf.textWithLink('View Document', docX + 2, docY + 6, { url: docUrl });
                    } else {
                        pdf.setFont('times', 'normal');
                        pdf.setFontSize(9);
                        pdf.setTextColor(150, 150, 150);
                        pdf.text('Not Uploaded', docX + 2, docY + 6);
                    }
                    
                    docX += docBoxW + 5;
                });
                currentY = docY + 24;
            }`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced the PDF document code.");
} else {
    console.log("Could not find the exact code block to replace.");
}
