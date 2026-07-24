import { useState, useEffect } from 'react';
import { DocumentIcon, EyeIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../utils/api';

const ApplicationPDFGenerator = ({ formData, application, onPDFGenerated, onCancel, skipDocumentValidation = false, autoGenerate = false, hideUI = false }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [error, setError] = useState(null);
    const [colleges, setColleges] = useState([]);

    // Fetch colleges for display
    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await api.get('/api/colleges/public');
                if (response.data.success) {
                    setColleges(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching colleges:', error);
            }
        };
        fetchColleges();
    }, []);

    // Auto generate PDF if requested
    useEffect(() => {
        if (autoGenerate && !isGenerating && !pdfUrl) {
            generatePDF();
        }
    }, [autoGenerate, isGenerating, pdfUrl]);

    // Helper function to add footer and page numbers (Compact for 2 pages)
    const addFooter = (pdf, pageNum, totalPages, pdfContent, pageWidth, pageHeight) => {
        const footerY = pageHeight - 10;
        
        // Compact footer background
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, footerY - 5, pageWidth, 10, 'F');
        
        // Top border line
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.line(10, footerY - 5, pageWidth - 10, footerY - 5);
        
        // Left side - Application info
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`App ID: ${pdfContent.applicationId}`, 12, footerY - 1);
        
        // Center - Company info (Link)
        pdf.setTextColor(0, 102, 204);
        pdf.setFontSize(6);
        pdf.text('www.swagatodisha.com', pageWidth / 2, footerY - 1, { align: 'center' });
        
        // Right side - Page number
        pdf.setTextColor(100, 100, 100);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 12, footerY - 1, { align: 'right' });
    };

    const generatePDF = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Validate mandatory documents before generating PDF
            if (!skipDocumentValidation) {
            const mandatoryDocuments = [
                "passport_photo",
                "aadhar_card",
                "marksheet_10th",
                "tenth_marksheet_certificate",
                "caste_certificate",
                "income_certificate",
            ];
            const missingMandatory = mandatoryDocuments.filter(
                (doc) => !formData?.documents?.[doc] || !formData.documents[doc].downloadUrl
            );
            // Check if at least one 10th marksheet variant exists
            const has10thMarksheet = formData?.documents?.["marksheet_10th"]?.downloadUrl || formData?.documents?.["tenth_marksheet_certificate"]?.downloadUrl;
            const actualMissing = missingMandatory.filter(doc => 
                doc !== "marksheet_10th" && doc !== "tenth_marksheet_certificate"
            );
            if (!has10thMarksheet) {
                actualMissing.push("marksheet_10th");
            }
            if (actualMissing.length > 0) {
                const docLabels = {
                    "passport_photo": "Passport Size Photo",
                    "aadhar_card": "Aadhar Card",
                    "marksheet_10th": "10th Marksheet",
                    "tenth_marksheet_certificate": "10th Marksheet cum Certificate",
                    "caste_certificate": "Caste Certificate",
                    "income_certificate": "Income Certificate",
                };
                const missingLabels = actualMissing.map(doc => docLabels[doc] || doc);
                setError(`Cannot generate PDF. Please upload all mandatory documents: ${missingLabels.join(", ")}`);
                setIsGenerating(false);
                return;
            }

            }

            // Create a comprehensive PDF content
            const pdfContent = createPDFContent(formData, application);

            // Generate premium PDF using jsPDF - EXACTLY 2 PAGES
            // PAGE 1: All form details (Personal, Contact, Family/Academic, Documents)
            // PAGE 2: Terms and Conditions + Signatures
            // ==========================================
            // FETCH IMAGES ASYNC BEFORE PDF GENERATION
            // ==========================================
            let logoBase64 = null;
            let logoRatio = 1;
            try {
                const response = await fetch('/Swagat_Logo.png');
                const blob = await response.blob();
                logoBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
                logoRatio = await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve(img.width / img.height);
                    img.onerror = () => resolve(1);
                    img.src = logoBase64;
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
                    let wmHeight = 60; // Scale down for clean, professional look
                    let wmWidth = wmHeight * logoRatio;
                    
                    // Ensure it doesn't get distorted or overflow
                    if (wmWidth > pageWidth - 60) {
                        wmWidth = pageWidth - 60;
                        wmHeight = wmWidth / logoRatio;
                    }
                    
                    p.addImage(logoBase64, 'PNG', (pageWidth - wmWidth)/2, (pageHeight - wmHeight)/2, wmWidth, wmHeight);
                    p.setGState(new p.GState({opacity: 1.0}));
                }
            };
            drawPageBorders(pdf);

            // ============================================
            // HEADER
            // ============================================
            yPosition = 18;
            
            // Logo centered
            if (logoBase64) {
                const logoHeight = 25;
                const logoWidth = logoHeight * logoRatio;
                pdf.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, yPosition, logoWidth, logoHeight);
            }
            
            yPosition += 32;
            
            // Admission Form Title
            pdf.setTextColor(25, 42, 86);
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
            const drawBoxedField = (label, value, x, y, w, h = 10) => {
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
                let textY = y + 7;
                const splitText = pdf.splitTextToSize(textStr, w - 4);
                
                if (splitText.length > 1 && h < 12) {
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
            const instituteName = pdfContent.courseDetails.institutionName || 'N/A';

            if (currentY < photoY + photoBoxHeight + 5) {
                // Fields to the left of the photo
                const leftWidth = pageWidth - 15 - photoBoxWidth - 20; // 20 spacing
                const halfWidth = (leftWidth - 5) / 2;
                
                drawBoxedField('Course', pdfContent.courseDetails.selectedCourse || pdfContent.courseDetails.courseName, leftColX, currentY, leftWidth);
                currentY += 16;
                
                drawBoxedField('Institute Name', instituteName, leftColX, currentY, leftWidth);
                currentY += 16;
                
                drawBoxedField('Stream', pdfContent.courseDetails.stream, leftColX, currentY, halfWidth);
                drawBoxedField('Session', "2024-2025", leftColX + halfWidth + 5, currentY, halfWidth);
                currentY += 16;
                
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
            currentY += 16;
            
            drawBoxedField('Aadhar Card No.', pdfContent.personalDetails.aadharNumber, leftColX, currentY, thirdW);
            drawBoxedField('Gender', pdfContent.personalDetails.gender, leftColX + thirdW + 5, currentY, thirdW);
            drawBoxedField('Birth Date', pdfContent.personalDetails.dateOfBirth, leftColX + (thirdW * 2) + 10, currentY, thirdW);
            currentY += 16;
            
            drawBoxedField('Category', pdfContent.personalDetails.category || pdfContent.personalDetails.status, leftColX, currentY, thirdW);
            drawBoxedField('Email Id', pdfContent.contactDetails.email, leftColX + thirdW + 5, currentY, thirdW * 2 + 5);
            currentY += 16;
            
            drawBoxedField('Primary Phone', pdfContent.contactDetails.primaryPhone, leftColX, currentY, halfW);
            drawBoxedField('Guardian Phone', pdfContent.guardianDetails.guardianPhone, leftColX + halfW + 5, currentY, halfW);
            currentY += 24;
            
            // Address Blocks
            pdf.setFont('times', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(0,0,0);
            pdf.text('Correspondence Address:', leftColX, currentY);
            currentY += 5;
            
            drawBoxedField('Address Line 1', pdfContent.contactDetails.permanentAddress?.street, leftColX, currentY, halfW + thirdW);
            drawBoxedField('State', pdfContent.contactDetails.permanentAddress?.state, leftColX + halfW + thirdW + 5, currentY, fullWidth - (halfW + thirdW + 5));
            currentY += 16;
            
            drawBoxedField('City / District', (pdfContent.contactDetails.permanentAddress?.city || '') + ' / ' + (pdfContent.contactDetails.permanentAddress?.district || ''), leftColX, currentY, halfW);
            drawBoxedField('Pin Code', pdfContent.contactDetails.permanentAddress?.pincode, leftColX + halfW + 5, currentY, thirdW);
            drawBoxedField('Country', 'India', leftColX + halfW + thirdW + 10, currentY, fullWidth - (halfW + thirdW + 10));
            currentY += 24;
            
            // Previous Qualifications Table
            pdf.setFont('times', 'bold');
            pdf.setFontSize(10);
            pdf.text('Previous Qualification / Documents:', leftColX, currentY);
            currentY += 5;
            
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
                        docY += 16;
                    }
                    drawBoxedField('Uploaded Document', documentNames[k] || k.replace(/_/g, ' '), docX, docY, docBoxW);
                    docX += docBoxW + 5;
                });
                currentY = docY + 24;
            } else {
                pdf.setFont('times', 'normal');
                pdf.setFontSize(9);
                pdf.text('No documents uploaded', leftColX, currentY + 5);
                currentY += 16;
            }

            // ============================================
            // PAGE 2: TERMS, CONDITIONS, & SIGNATURES
            // ============================================
            pdf.addPage();
            drawPageBorders(pdf);
            
            let page2Y = 25;
            
            // Page Title
            pdf.setTextColor(25, 42, 86);
            pdf.setFont('times', 'bold');
            pdf.setFontSize(16);
            pdf.text('TERMS AND CONDITIONS', pageWidth / 2, page2Y, { align: 'center' });
            
            const p2TitleWidth = pdf.getTextWidth('TERMS AND CONDITIONS');
            pdf.setLineWidth(0.5);
            pdf.line((pageWidth - p2TitleWidth)/2, page2Y + 1.5, (pageWidth + p2TitleWidth)/2, page2Y + 1.5);
            
            page2Y += 15;
            
            // Terms Content
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(10);
            pdf.setFont('times', 'bold');
            
            const terms = [
                { title: '1. Application Submission:', body: 'I hereby declare that all information provided in this application is true and correct to the best of my knowledge and belief.' },
                { title: '2. Document Verification:', body: 'I understand that all submitted documents will be verified and any false information or tampered documents may result in immediate rejection of the application and cancellation of admission at any stage.' },
                { title: '3. Fee Payment:', body: 'I agree to pay all applicable fees as per the institution\'s fee structure and payment schedule. I understand that failure to pay fees on time may lead to penalties or suspension of my enrollment.' },
                { title: '4. Academic Performance:', body: 'I understand that admission is strictly subject to meeting the minimum academic requirements, availability of seats, and approval from the respective university or board.' },
                { title: '5. Code of Conduct:', body: 'I agree to abide by the institution\'s rules, regulations, and code of conduct during my entire tenure. Any disciplinary violation may result in strict action including rustication.' },
                { title: '6. Data Privacy:', body: 'I consent to the collection, processing, and storage of my personal data for academic, administrative, and compliance purposes by Swagat Odisha and affiliated institutions.' },
                { title: '7. Refund Policy:', body: 'I have read and understand the institution\'s refund policy and agree to the terms and conditions regarding fee refunds in case of cancellation or withdrawal.' },
                { title: '8. Medical Fitness:', body: 'I declare that I am medically fit to pursue the selected course and will provide necessary medical certificates if required by the college authorities.' },
                { title: '9. Dispute Resolution:', body: 'Any disputes arising out of the admission process or during the course of study will be subject to the exclusive jurisdiction of the courts in Odisha.' }
            ];
            
            terms.forEach((term, idx) => {
                // Title
                pdf.setFont('times', 'bold');
                pdf.text(term.title, leftColX, page2Y);
                
                // Body
                pdf.setFont('times', 'normal');
                const splitBody = pdf.splitTextToSize(term.body, fullWidth - pdf.getTextWidth(term.title) - 2);
                pdf.text(splitBody, leftColX + pdf.getTextWidth(term.title) + 2, page2Y);
                
                // Calculate height dynamically based on lines
                const lines = splitBody.length;
                page2Y += (lines * 4.5) + 5; // Reduced spacing to avoid overlap with signatures
            });
            
            // Declaration Text (to fill extra space before signatures)
            page2Y += 5; // Reduced spacing
            pdf.setFont('times', 'bold');
            pdf.setFontSize(12);
            pdf.text('DECLARATION', leftColX, page2Y);
            page2Y += 5; // Reduced spacing
            
            pdf.setFontSize(10);
            pdf.setFont('times', 'normal');
            const declarationText = "I have carefully read and understood all the above terms and conditions. I hereby declare that the information provided in this admission form is true and complete to the best of my knowledge and belief. My admission may be cancelled at any stage if it is found to be incorrect. I also undertake to abide by all the rules and regulations of the university and college from time to time.";
            const decLines = pdf.splitTextToSize(declarationText, fullWidth);
            pdf.text(decLines, leftColX, page2Y);
            
            // Signatures at the bottom
            const bottomY = pageHeight - 35;
            
            pdf.setFont('times', 'bold');
            pdf.setFontSize(10);
            
            // Left Signature (shifted right slightly for aesthetics)
            const parentSigX = leftColX + 15;
            pdf.text("Signature of Parent / Guardian", parentSigX + 20, bottomY, { align: 'center' });
            pdf.setLineWidth(0.3);
            pdf.setDrawColor(100, 100, 100);
            pdf.line(parentSigX, bottomY - 5, parentSigX + 40, bottomY - 5);
            
            // Center Date
            pdf.text("Date: ___ / ___ / 20__", pageWidth / 2, bottomY, { align: 'center' });
            
            // Right Signature
            pdf.text("Signature of Applicant", pageWidth - leftColX - 20, bottomY, { align: 'center' });
            pdf.line(pageWidth - leftColX - 40, bottomY - 5, pageWidth - leftColX, bottomY - 5);
            
            const totalPagesCount = pdf.internal.getNumberOfPages();
            
            // Remove any extra pages beyond 2
            while (pdf.internal.getNumberOfPages() > 2) {
                pdf.deletePage(3);
            }
            
            // Add footer to all pages
            for (let i = 1; i <= totalPagesCount; i++) {
                pdf.setPage(i);
                addFooter(pdf, i, totalPagesCount, pdfContent, pageWidth, pageHeight);
            }
            
            // Return to last page
            pdf.setPage(totalPagesCount);

            // Generate PDF blob
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            // PDF generation should be client-only. Creating draft applications here caused
            // accidental duplicate registrations (PDF generate + submit).
            // Notify parent once.
            if (onPDFGenerated) onPDFGenerated(url);

        } catch (err) {
            console.error('PDF generation error:', err);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const createPDFContent = (formData, application) => {
        console.log('createPDFContent - formData:', formData);
        console.log('createPDFContent - application:', application);
        console.log('createPDFContent - formData.personalDetails:', formData?.personalDetails);
        console.log('createPDFContent - formData.contactDetails:', formData?.contactDetails);
        console.log('createPDFContent - formData.documents:', formData?.documents);
        console.log('createPDFContent - formData.documents keys:', Object.keys(formData?.documents || {}));
        console.log('createPDFContent - formData.documents count:', Object.keys(formData?.documents || {}).length);
        
        // Ensure all data is properly structured with fallbacks
        return {
            applicationId: application?.applicationId || formData?.applicationId || 'DRAFT',
            generatedDate: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            }),
            personalDetails: formData?.personalDetails || {},
            contactDetails: formData?.contactDetails || {},
            courseDetails: formData?.courseDetails || {},
            guardianDetails: formData?.guardianDetails || {},
            documents: formData?.documents || {},
            referralCode: formData?.referralCode || null
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
                    <span class="field-label">Primary Phone:</span>
                    <span class="field-value">${content.contactDetails.primaryPhone || 'N/A'}</span>
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

    if (hideUI) {
        return null;
    }

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
