import { useState } from 'react';
import { DocumentIcon, EyeIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ApplicationPDFGenerator = ({ formData, application, onPDFGenerated, onCancel }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [error, setError] = useState(null);

    const generatePDF = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Create a comprehensive PDF content
            const pdfContent = createPDFContent(formData, application);

            // Generate actual PDF using jsPDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPosition = 20;

            // Set font
            pdf.setFont('helvetica');

            // Professional Header
            pdf.setFillColor(99, 102, 241); // Purple background
            pdf.rect(0, 0, pageWidth, 30, 'F');
            
            pdf.setTextColor(255, 255, 255); // White text
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SWAGAT ODISHA', pageWidth / 2, 12, { align: 'center' });
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Student Application Form', pageWidth / 2, 20, { align: 'center' });
            
            pdf.setFontSize(9);
            pdf.text(`Application ID: ${pdfContent.applicationId}`, 20, 26);
            pdf.text(`Date: ${pdfContent.generatedDate}`, pageWidth - 60, 26);
            
            yPosition = 40;

            // Personal Details Section
            pdf.setFillColor(248, 250, 252); // Light gray background
            pdf.rect(15, yPosition - 2, pageWidth - 30, 12, 'F');
            
            pdf.setTextColor(99, 102, 241); // Purple text
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('1. Personal Details', 20, yPosition + 4);
            yPosition += 10;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);

            // Simple personal details list
            const personalDetails = [
                { label: 'Full Name:', value: pdfContent.personalDetails.fullName || 'N/A' },
                { label: 'Date of Birth:', value: pdfContent.personalDetails.dateOfBirth || 'N/A' },
                { label: 'Gender:', value: pdfContent.personalDetails.gender || 'N/A' },
                { label: 'Aadhar Number:', value: pdfContent.personalDetails.aadharNumber || 'N/A' },
                { label: 'Category:', value: pdfContent.personalDetails.status || pdfContent.personalDetails.category || 'N/A' },
                { label: 'Father\'s Name:', value: pdfContent.personalDetails.fathersName || 'N/A' },
                { label: 'Mother\'s Name:', value: pdfContent.personalDetails.mothersName || 'N/A' }
            ];

            personalDetails.forEach((item) => {
                pdf.setFont('helvetica', 'bold');
                pdf.text(item.label, 20, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(item.value, 80, yPosition);
                yPosition += 6;
            });

            yPosition += 5;

            // Contact Details Section
            pdf.setFillColor(248, 250, 252); // Light gray background
            pdf.rect(15, yPosition - 2, pageWidth - 30, 12, 'F');
            
            pdf.setTextColor(99, 102, 241); // Purple text
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('2. Contact Details', 20, yPosition + 4);
            yPosition += 10;

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);

            const contactDetails = [
                { label: 'Email:', value: pdfContent.contactDetails.email || 'N/A' },
                { label: 'Primary Phone:', value: pdfContent.contactDetails.primaryPhone || 'N/A' },
                { label: 'WhatsApp:', value: pdfContent.contactDetails.whatsappNumber || 'N/A' },
                { label: 'Street Address:', value: pdfContent.contactDetails.permanentAddress?.street || 'N/A' },
                { label: 'City:', value: pdfContent.contactDetails.permanentAddress?.city || 'N/A' },
                { label: 'State:', value: pdfContent.contactDetails.permanentAddress?.state || 'N/A' },
                { label: 'Pincode:', value: pdfContent.contactDetails.permanentAddress?.pincode || 'N/A' }
            ];

            contactDetails.forEach((item) => {
                pdf.setFont('helvetica', 'bold');
                pdf.text(item.label, 20, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(item.value, 80, yPosition);
                yPosition += 6;
            });

            yPosition += 5;

            // Family Details Section
            pdf.setFillColor(248, 250, 252); // Light gray background
            pdf.rect(15, yPosition - 2, pageWidth - 30, 12, 'F');
            
            pdf.setTextColor(99, 102, 241); // Purple text
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('3. Family & Academic Details', 20, yPosition + 4);
            yPosition += 10;

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);

            const familyDetails = [
                { label: 'Father\'s Name:', value: pdfContent.personalDetails.fathersName || 'N/A' },
                { label: 'Mother\'s Name:', value: pdfContent.personalDetails.mothersName || 'N/A' },
                { label: 'Guardian Name:', value: pdfContent.guardianDetails.guardianName || 'N/A' },
                { label: 'Relationship:', value: pdfContent.guardianDetails.relationship || 'N/A' },
                { label: 'Guardian Phone:', value: pdfContent.guardianDetails.guardianPhone || 'N/A' },
                { label: 'Guardian Email:', value: pdfContent.guardianDetails.guardianEmail || 'N/A' },
                { label: 'Institution Name:', value: pdfContent.courseDetails.institutionName || 'N/A' },
                { label: 'Course Name:', value: pdfContent.courseDetails.courseName || 'N/A' },
                { label: 'Stream:', value: pdfContent.courseDetails.stream || 'N/A' }
            ];

            familyDetails.forEach((item) => {
                pdf.setFont('helvetica', 'bold');
                pdf.text(item.label, 20, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(item.value, 80, yPosition);
                yPosition += 6;
            });

            yPosition += 5;

            // Add referral code
            if (pdfContent.referralCode) {
                pdf.setFont('helvetica', 'bold');
                pdf.text('Referral Code:', 20, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(pdfContent.referralCode, 80, yPosition);
                yPosition += 6;
            }

            yPosition += 5;

            // Documents Section
            pdf.setFillColor(248, 250, 252); // Light gray background
            pdf.rect(15, yPosition - 2, pageWidth - 30, 12, 'F');
            
            pdf.setTextColor(99, 102, 241); // Purple text
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('4. Uploaded Documents', 20, yPosition + 4);
            yPosition += 10;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');

            // Simple documents list with clickable links
            const documents = Object.entries(pdfContent.documents || {});
            
            // Debug: Log documents to console
            console.log('PDF Generator - Documents received:', documents);
            console.log('PDF Generator - pdfContent.documents:', pdfContent.documents);
            
            const documentNames = {
                'passport_photo': 'Passport Size Photo',
                'aadhar_card': 'Aadhar Card',
                'birth_certificate': 'Birth Certificate',
                'marksheet_10th': '10th Marksheet cum Certificate',
                'marksheet_12th': '12th Marksheet cum Certificate',
                'transfer_certificate': 'Transfer Certificate',
                'caste_certificate': 'Caste Certificate',
                'income_certificate': 'Income Certificate',
                'resident_certificate': 'Resident Certificate',
                'pm_kisan_enrollment': 'PM Kisan Enrollment',
                'cm_kisan_enrollment': 'CM Kisan Enrollment'
            };

            if (documents.length > 0) {
                console.log('Processing documents, count:', documents.length);
                // Use optimized layout with two columns and reduced spacing
                documents.forEach(([key, doc], index) => {
                    console.log(`Document ${index + 1}: key="${key}", doc=`, doc);
                    const docName = documentNames[key] || key.replace(/_/g, ' ').toUpperCase();
                    const fileName = doc.name || doc.fileName || 'Not Uploaded';
                    const fileSize = doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'N/A';
                    console.log(`  → docName: "${docName}", fileName: "${fileName}", fileSize: "${fileSize}"`);
                    
                    // Use two-column layout for space efficiency
                    const col = index % 2; // 0 or 1 for column
                    const row = Math.floor(index / 2); // 0, 1, 2 for row
                    const xPos = 20 + (col * 95); // Two columns with margin
                    let currentY = yPosition + (row * 10); // Reduced spacing: 10mm per row
                    
                    // Check if we need a new page before adding new row
                    if (row > 0 && col === 0 && currentY > pageHeight - 80) {
                        pdf.addPage();
                        yPosition = 30; // Reset for new page
                        currentY = yPosition + (row % 6 * 10); // Continue from new page, reset rows
                    }
                    
                    // Document name
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(10); // Smaller font to fit better
                    pdf.setTextColor(0, 0, 0);
                    pdf.text(`${docName}:`, xPos, currentY);
                    
                    // File name as clickable link
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(9); // Smaller font for filenames
                    if (doc.downloadUrl || doc.filePath) {
                        // Add clickable link with blue color
                        pdf.setTextColor(0, 0, 255); // Blue color for links
                        const linkText = `• ${fileName} (${fileSize})`;
                        pdf.text(linkText, xPos, currentY + 4);
                        
                        // Create clickable link
                        const textWidth = pdf.getTextWidth(linkText);
                        pdf.link(xPos, currentY, textWidth, 4, {
                            url: doc.downloadUrl || doc.filePath
                        });
                        
                        pdf.setTextColor(0, 0, 0); // Reset to black
                    } else {
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(`• ${fileName} (${fileSize})`, xPos, currentY + 4);
                    }
                });
                
                // Update yPosition for next section (after all documents)
                const totalRows = Math.ceil(documents.length / 2);
                yPosition += (totalRows * 10) + 10; // Space after documents section
                
                // Reset font size for next sections
                pdf.setFontSize(12);
            } else {
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);
                pdf.text('No documents uploaded yet', 20, yPosition);
                yPosition += 6;
            }

            yPosition += 10;

            // Terms and Conditions Section
            pdf.setFillColor(248, 250, 252); // Light gray background
            pdf.rect(15, yPosition - 2, pageWidth - 30, 12, 'F');
            
            pdf.setTextColor(99, 102, 241); // Purple text
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('5. Terms and Conditions', 20, yPosition + 4);
            yPosition += 10;

            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0);

            const terms = [
                '1. Application Submission: I hereby declare that all information provided in this application is true and correct to the best of my knowledge.',
                '2. Document Verification: I understand that all submitted documents will be verified and any false information may result in rejection of the application.',
                '3. Fee Payment: I agree to pay all applicable fees as per the institution\'s fee structure and payment schedule.',
                '4. Academic Performance: I understand that admission is subject to meeting the minimum academic requirements and availability of seats.',
                '5. Code of Conduct: I agree to abide by the institution\'s rules, regulations, and code of conduct during my tenure.',
                '6. Data Privacy: I consent to the collection, processing, and storage of my personal data for academic and administrative purposes.',
                '7. Refund Policy: I understand the institution\'s refund policy and agree to the terms and conditions regarding fee refunds.',
                '8. Medical Fitness: I declare that I am medically fit to pursue the selected course and will provide medical certificates if required.'
            ];

            terms.forEach(term => {
                const lines = pdf.splitTextToSize(term, pageWidth - 40);
                lines.forEach(line => {
                    if (yPosition > pageHeight - 30) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    pdf.text(line, 20, yPosition);
                    yPosition += 5;
                });
                yPosition += 2;
            });

            yPosition += 10;

            // Signature Section
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            pdf.text('Student Signature:', 20, yPosition);
            pdf.text('Parent/Guardian Signature:', pageWidth / 2 + 20, yPosition);
            yPosition += 15;

            pdf.line(20, yPosition, 100, yPosition);
            pdf.line(pageWidth / 2 + 20, yPosition, pageWidth / 2 + 100, yPosition);
            yPosition += 10;

            pdf.setFontSize(8);
            pdf.text('Date: _______________', 20, yPosition);
            pdf.text('Date: _______________', pageWidth / 2 + 20, yPosition);

            // Professional Footer
            pdf.setFillColor(99, 102, 241); // Purple background
            pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
            
            pdf.setTextColor(255, 255, 255); // White text
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SWAGAT ODISHA - Educational Excellence Platform', pageWidth / 2, pageHeight - 18, { align: 'center' });
            
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Application ID: ${pdfContent.applicationId} | Generated: ${pdfContent.generatedDate}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
            pdf.text('Website: www.swagatodisha.com | Email: contact@swagatodisha.com', pageWidth / 2, pageHeight - 6, { align: 'center' });

            // Generate PDF blob
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            // Call the callback if provided
            if (onPDFGenerated) {
                onPDFGenerated(url);
            }

        } catch (err) {
            console.error('PDF generation error:', err);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const createPDFContent = (formData, application) => {
        console.log('createPDFContent - formData.documents:', formData.documents);
        console.log('createPDFContent - formData.documents keys:', Object.keys(formData.documents || {}));
        console.log('createPDFContent - formData.documents count:', Object.keys(formData.documents || {}).length);
        
        return {
            applicationId: application?.applicationId || 'DRAFT',
            generatedDate: new Date().toLocaleDateString(),
            personalDetails: formData.personalDetails,
            contactDetails: formData.contactDetails,
            courseDetails: formData.courseDetails,
            guardianDetails: formData.guardianDetails,
            documents: formData.documents,
            referralCode: formData.referralCode
        };
    };

    const generateHTMLContent = (content) => {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student Application - ${content.applicationId}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.4; 
            color: #333; 
            background: #fff;
        }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #6366f1; 
            padding-bottom: 15px; 
            margin-bottom: 25px; 
        }
        .header h1 { color: #6366f1; font-size: 24px; margin-bottom: 5px; }
        .header .subtitle { color: #666; font-size: 14px; }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 20px; 
        }
        .section { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 15px; 
            margin-bottom: 15px; 
        }
        .section-title { 
            color: #6366f1; 
            font-weight: 600; 
            font-size: 16px; 
            margin-bottom: 12px; 
            border-bottom: 1px solid #e2e8f0; 
            padding-bottom: 5px; 
        }
        .field-row { 
            display: flex; 
            margin-bottom: 8px; 
            align-items: flex-start; 
        }
        .field-label { 
            font-weight: 600; 
            color: #4a5568; 
            min-width: 120px; 
            font-size: 13px; 
        }
        .field-value { 
            color: #2d3748; 
            flex: 1; 
            font-size: 13px; 
        }
        .documents-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 8px; 
            margin-top: 10px; 
        }
        .document-item { 
            background: #fff; 
            border: 1px solid #e2e8f0; 
            padding: 8px; 
            border-radius: 4px; 
            font-size: 12px; 
        }
        .document-name { font-weight: 600; color: #4a5568; }
        .document-size { color: #718096; font-size: 11px; }
        .terms-section { 
            background: #fef5e7; 
            border: 1px solid #f6ad55; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0; 
        }
        .terms-title { 
            color: #c05621; 
            font-weight: 600; 
            margin-bottom: 10px; 
        }
        .terms-content { 
            font-size: 12px; 
            line-height: 1.5; 
            color: #744210; 
        }
        .signature-section { 
            margin-top: 30px; 
            display: flex; 
            justify-content: space-between; 
            border-top: 1px solid #e2e8f0; 
            padding-top: 20px; 
        }
        .signature-box { 
            text-align: center; 
            width: 200px; 
        }
        .signature-line { 
            border-bottom: 1px solid #333; 
            height: 40px; 
            margin-bottom: 5px; 
        }
        .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 11px; 
            color: #718096; 
            border-top: 1px solid #e2e8f0; 
            padding-top: 15px; 
        }
        @media print { 
            body { margin: 0; }
            .container { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SWAGAT ODISHA</h1>
            <div class="subtitle">Student Application Form</div>
            <div class="subtitle">Application ID: ${content.applicationId} | Date: ${content.generatedDate}</div>
        </div>

        <div class="info-grid">
            <div class="section">
                <div class="section-title">Personal Details</div>
                <div class="field-row">
                    <span class="field-label">Full Name:</span>
                    <span class="field-value">${content.personalDetails.fullName || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Date of Birth:</span>
                    <span class="field-value">${content.personalDetails.dateOfBirth || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Gender:</span>
                    <span class="field-value">${content.personalDetails.gender || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Aadhar No:</span>
                    <span class="field-value">${content.personalDetails.aadharNumber || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Category:</span>
                    <span class="field-value">${content.personalDetails.category || 'N/A'}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Contact Details</div>
                <div class="field-row">
                    <span class="field-label">Email:</span>
                    <span class="field-value">${content.contactDetails.email || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Phone:</span>
                    <span class="field-value">${content.contactDetails.primaryPhone || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">WhatsApp:</span>
                    <span class="field-value">${content.contactDetails.whatsappNumber || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Address:</span>
                    <span class="field-value">${content.contactDetails.permanentAddress?.street || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">City, State:</span>
                    <span class="field-value">${content.contactDetails.permanentAddress?.city || 'N/A'}, ${content.contactDetails.permanentAddress?.state || 'N/A'} - ${content.contactDetails.permanentAddress?.pincode || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="info-grid">
            <div class="section">
                <div class="section-title">Family Details</div>
                <div class="field-row">
                    <span class="field-label">Father's Name:</span>
                    <span class="field-value">${content.personalDetails.fathersName || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Mother's Name:</span>
                    <span class="field-value">${content.personalDetails.mothersName || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Guardian Name:</span>
                    <span class="field-value">${content.guardianDetails.guardianName || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Relationship:</span>
                    <span class="field-value">${content.guardianDetails.relationship || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Guardian Phone:</span>
                    <span class="field-value">${content.guardianDetails.guardianPhone || 'N/A'}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Academic Details</div>
                <div class="field-row">
                    <span class="field-label">Institution Name:</span>
                    <span class="field-value">${content.courseDetails.institutionName || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Course Name:</span>
                    <span class="field-value">${content.courseDetails.courseName || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Stream:</span>
                    <span class="field-value">${content.courseDetails.stream || 'N/A'}</span>
                </div>
                ${content.referralCode ? `
                <div class="field-row">
                    <span class="field-label">Referral Code:</span>
                    <span class="field-value">${content.referralCode}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Uploaded Documents</div>
            <div class="documents-grid">
                ${Object.entries(content.documents || {}).map(([key, doc]) =>
            `<div class="document-item">
                        <div class="document-name">${key.replace(/_/g, ' ').toUpperCase()}</div>
                        <div class="document-size">${doc.name || 'Uploaded'} ${doc.size ? '(' + (doc.size / 1024).toFixed(1) + ' KB)' : ''}</div>
                    </div>`
        ).join('')}
            </div>
        </div>

        <div class="terms-section">
            <div class="terms-title">Terms and Conditions</div>
            <div class="terms-content">
                <p><strong>1. Application Submission:</strong> I hereby declare that all information provided in this application is true and correct to the best of my knowledge.</p>
                <p><strong>2. Document Verification:</strong> I understand that all submitted documents will be verified and any false information may result in rejection of the application.</p>
                <p><strong>3. Fee Payment:</strong> I agree to pay all applicable fees as per the institution's fee structure and payment schedule.</p>
                <p><strong>4. Academic Performance:</strong> I understand that admission is subject to meeting the minimum academic requirements and availability of seats.</p>
                <p><strong>5. Code of Conduct:</strong> I agree to abide by the institution's rules, regulations, and code of conduct during my tenure.</p>
                <p><strong>6. Data Privacy:</strong> I consent to the collection, processing, and storage of my personal data for academic and administrative purposes.</p>
                <p><strong>7. Refund Policy:</strong> I understand the institution's refund policy and agree to the terms and conditions regarding fee refunds.</p>
                <p><strong>8. Medical Fitness:</strong> I declare that I am medically fit to pursue the selected course and will provide medical certificates if required.</p>
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Student Signature</div>
                <div style="font-size: 11px; color: #666; margin-top: 5px;">Date: _______________</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Parent/Guardian Signature</div>
                <div style="font-size: 11px; color: #666; margin-top: 5px;">Date: _______________</div>
            </div>
        </div>

        <div class="footer">
            <p><strong>Swagat Odisha - Educational Excellence</strong></p>
            <p>This application was generated electronically and is valid without physical signature.</p>
            <p>For any queries, contact: support@swagatodisha.com | Phone: +91-XXX-XXXX-XXXX</p>
        </div>
    </div>
</body>
</html>`;
    };

    const downloadPDF = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `student-application-${formData.personalDetails.fullName || 'draft'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const printPDF = () => {
        if (pdfUrl) {
            // For PDF files, we can open in a new tab and let the browser handle printing
            const printWindow = window.open(pdfUrl, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Application PDF</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Generate, preview, and download your application as a PDF document.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <DocumentIcon className="w-8 h-8 text-purple-600" />
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Student Application
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formData.personalDetails.fullName || 'Draft Application'}
                            </p>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={generatePDF}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                            <DocumentIcon className="w-4 h-4" />
                            <span>{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
                        </button>
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                disabled={isGenerating}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
                            >
                                <span>Cancel</span>
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                        <p className="text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                {pdfUrl && (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
                            <p className="text-green-700 dark:text-green-400">
                                ✅ PDF generated successfully! You can now preview, download, or print the PDF file.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => window.open(pdfUrl, '_blank')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                            >
                                <EyeIcon className="w-4 h-4" />
                                <span>Preview</span>
                            </button>

                            <button
                                onClick={downloadPDF}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                <span>Download</span>
                            </button>

                            <button
                                onClick={printPDF}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                            >
                                <PrinterIcon className="w-4 h-4" />
                                <span>Print</span>
                            </button>
                        </div>

                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Application Summary:</h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Name:</span> {formData.personalDetails.fullName || 'N/A'}
                                </div>
                                <div>
                                    <span className="font-medium">Institution:</span> {formData.courseDetails.institutionName || 'N/A'}
                                </div>
                                <div>
                                    <span className="font-medium">Course:</span> {formData.courseDetails.courseName || 'N/A'}
                                </div>
                                <div>
                                    <span className="font-medium">Email:</span> {formData.contactDetails.email || 'N/A'}
                                </div>
                                <div>
                                    <span className="font-medium">Phone:</span> {formData.contactDetails.phone || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!pdfUrl && !isGenerating && (
                    <div className="text-center py-8">
                        <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            Click "Generate PDF" to create your application document.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationPDFGenerator;
