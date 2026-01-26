import { useState, useEffect } from 'react';
import { DocumentIcon, EyeIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../utils/api';

const ApplicationPDFGenerator = ({ formData, application, onPDFGenerated, onCancel }) => {
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
        
        // Center - Company info
        pdf.setTextColor(120, 120, 120);
        pdf.setFontSize(6);
        pdf.text('SWAGAT ODISHA', pageWidth / 2, footerY - 1, { align: 'center' });
        
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

            // Create a comprehensive PDF content
            const pdfContent = createPDFContent(formData, application);

            // Generate premium PDF using jsPDF - LIMITED TO 2 PAGES
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const maxYPage1 = pageHeight - 15; // Leave space for footer
            const maxYPage2 = pageHeight - 15;
            let yPosition = 0;

            // Set premium fonts
            pdf.setFont('helvetica');

            // ============================================
            // COMPACT HEADER (Reduced from 40mm to 25mm)
            // ============================================
            
            // Compact header background
            pdf.setFillColor(79, 70, 229);
            pdf.rect(0, 0, pageWidth, 25, 'F');
            
            // Main title - smaller
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SWAGAT ODISHA', pageWidth / 2, 9, { align: 'center' });
            
            // Subtitle - smaller
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(255, 255, 255);
            pdf.text('Educational Excellence Platform', pageWidth / 2, 14, { align: 'center' });
            
            // Form title - smaller
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('STUDENT APPLICATION FORM', pageWidth / 2, 19, { align: 'center' });
            
            // Application info - compact
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`App ID: ${pdfContent.applicationId}`, 15, 23);
            pdf.text(`Date: ${pdfContent.generatedDate}`, pageWidth - 15, 23, { align: 'right' });
            
            yPosition = 30;

            // ============================================
            // SECTION 1: PERSONAL DETAILS (Two-column layout)
            // ============================================
            
            // Compact section header
            pdf.setFillColor(79, 70, 229);
            pdf.rect(10, yPosition, pageWidth - 20, 6, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('1. PERSONAL DETAILS', 15, yPosition + 4.5);
            
            yPosition += 8;
            
            // Two-column layout for personal details
            const col1X = 12;
            const col2X = pageWidth / 2 + 5;
            const colWidth = (pageWidth - 30) / 2;
            let col1Y = yPosition;
            let col2Y = yPosition;
            
            const personalDetails = [
                { label: 'Full Name', value: pdfContent.personalDetails.fullName || 'N/A' },
                { label: 'DOB', value: pdfContent.personalDetails.dateOfBirth || 'N/A' },
                { label: 'Gender', value: pdfContent.personalDetails.gender || 'N/A' },
                { label: 'Aadhar', value: pdfContent.personalDetails.aadharNumber || 'N/A' },
                { label: 'Category', value: pdfContent.personalDetails.status || pdfContent.personalDetails.category || 'N/A' },
                { label: 'Father', value: pdfContent.personalDetails.fathersName || 'N/A' },
                { label: 'Mother', value: pdfContent.personalDetails.mothersName || 'N/A' }
            ];

            personalDetails.forEach((item, index) => {
                const isCol1 = index < 4; // First 4 in column 1, rest in column 2
                const currentX = isCol1 ? col1X : col2X;
                let currentY = isCol1 ? col1Y : col2Y;
                
                // Compact row
                const rowHeight = 5;
                
                // Label
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 30, 30);
                pdf.setFontSize(8);
                pdf.text(item.label + ':', currentX, currentY + 3.5);
                
                // Value
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(50, 50, 50);
                pdf.setFontSize(8);
                const valueX = currentX + 35;
                const maxWidth = colWidth - 40;
                
                const valueLines = pdf.splitTextToSize(item.value || 'N/A', maxWidth);
                valueLines.forEach((line, lineIndex) => {
                    pdf.text(line, valueX, currentY + 3.5 + (lineIndex * 4));
                });
                
                if (isCol1) {
                    col1Y += Math.max(rowHeight, valueLines.length * 4) + 2;
                } else {
                    col2Y += Math.max(rowHeight, valueLines.length * 4) + 2;
                }
            });
            
            yPosition = Math.max(col1Y, col2Y) + 7;

            // ============================================
            // SECTION 2: CONTACT DETAILS (Two-column layout)
            // ============================================
            
            // Check if we need to move to page 2
            if (yPosition > maxYPage1 - 50) {
                pdf.addPage();
                yPosition = 20;
            }

            // Compact section header
            pdf.setFillColor(16, 185, 129);
            pdf.rect(10, yPosition, pageWidth - 20, 6, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('2. CONTACT DETAILS', 15, yPosition + 4.5);
            
            yPosition += 8;
            
            // Two-column layout
            col1Y = yPosition;
            col2Y = yPosition;

            const contactDetails = [
                { label: 'Email', value: pdfContent.contactDetails.email || 'N/A' },
                { label: 'Phone', value: pdfContent.contactDetails.primaryPhone || 'N/A' },
                { label: 'WhatsApp', value: pdfContent.contactDetails.whatsappNumber || 'N/A' },
                { label: 'Address', value: pdfContent.contactDetails.permanentAddress?.street || 'N/A' },
                { label: 'City', value: pdfContent.contactDetails.permanentAddress?.city || 'N/A' },
                { label: 'District', value: pdfContent.contactDetails.permanentAddress?.district || 'N/A' },
                { label: 'State', value: pdfContent.contactDetails.permanentAddress?.state || 'N/A' },
                { label: 'Pincode', value: pdfContent.contactDetails.permanentAddress?.pincode || 'N/A' }
            ];

            contactDetails.forEach((item, index) => {
                const isCol1 = index < 4;
                const currentX = isCol1 ? col1X : col2X;
                let currentY = isCol1 ? col1Y : col2Y;
                
                const rowHeight = 5;
                
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 30, 30);
                pdf.setFontSize(8);
                pdf.text(item.label + ':', currentX, currentY + 3.5);
                
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(50, 50, 50);
                pdf.setFontSize(8);
                const valueX = currentX + 35;
                const maxWidth = colWidth - 40;
                
                const valueLines = pdf.splitTextToSize(item.value || 'N/A', maxWidth);
                valueLines.forEach((line, lineIndex) => {
                    pdf.text(line, valueX, currentY + 3.5 + (lineIndex * 4));
                });
                
                if (isCol1) {
                    col1Y += Math.max(rowHeight, valueLines.length * 4) + 2;
                } else {
                    col2Y += Math.max(rowHeight, valueLines.length * 4) + 2;
                }
            });
            
            yPosition = Math.max(col1Y, col2Y) + 7;

            // ============================================
            // SECTION 3: FAMILY & ACADEMIC DETAILS (Two-column)
            // ============================================
            
            // Check if we need to move to page 2
            if (yPosition > maxYPage1 - 50) {
                pdf.addPage();
                yPosition = 20;
            }

            // Compact section header
            pdf.setFillColor(234, 88, 12);
            pdf.rect(10, yPosition, pageWidth - 20, 6, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('3. FAMILY & ACADEMIC DETAILS', 15, yPosition + 4.5);
            
            yPosition += 8;
            
            // Two-column layout
            col1Y = yPosition;
            col2Y = yPosition;

            // Get college name if available
            const collegeName = pdfContent.courseDetails.selectedCollege 
                ? (colleges?.find(c => c._id === pdfContent.courseDetails.selectedCollege)?.name || 'N/A')
                : (pdfContent.courseDetails.institutionName || 'N/A');

            const familyDetails = [
                { label: 'Guardian', value: pdfContent.guardianDetails.guardianName || 'N/A' },
                { label: 'Relation', value: pdfContent.guardianDetails.relationship || 'N/A' },
                { label: 'G. Phone', value: pdfContent.guardianDetails.guardianPhone || 'N/A' },
                { label: 'G. Email', value: pdfContent.guardianDetails.guardianEmail || 'N/A' },
                { label: 'College', value: collegeName },
                { label: 'Course', value: pdfContent.courseDetails.selectedCourse || pdfContent.courseDetails.courseName || 'N/A' },
                { label: 'Stream', value: pdfContent.courseDetails.stream || 'N/A' }
            ];

            if (pdfContent.referralCode) {
                familyDetails.push({ label: 'Referral', value: pdfContent.referralCode });
            }

            familyDetails.forEach((item, index) => {
                const isCol1 = index < 4;
                const currentX = isCol1 ? col1X : col2X;
                let currentY = isCol1 ? col1Y : col2Y;
                
                const rowHeight = 5;
                
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 30, 30);
                pdf.setFontSize(8);
                pdf.text(item.label + ':', currentX, currentY + 3.5);
                
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(50, 50, 50);
                pdf.setFontSize(8);
                const valueX = currentX + 35;
                const maxWidth = colWidth - 40;
                
                const valueLines = pdf.splitTextToSize(item.value || 'N/A', maxWidth);
                valueLines.forEach((line, lineIndex) => {
                    pdf.text(line, valueX, currentY + 3.5 + (lineIndex * 4));
                });
                
                if (isCol1) {
                    col1Y += Math.max(rowHeight, valueLines.length * 4) + 2;
                } else {
                    col2Y += Math.max(rowHeight, valueLines.length * 4) + 2;
                }
            });
            
            yPosition = Math.max(col1Y, col2Y) + 7;

            // ============================================
            // SECTION 4: UPLOADED DOCUMENTS (Compact grid)
            // ============================================
            
            // Check if we need to move to page 2
            if (yPosition > maxYPage1 - 40) {
                pdf.addPage();
                yPosition = 20;
            }

            // Compact section header
            pdf.setFillColor(37, 99, 235);
            pdf.rect(10, yPosition, pageWidth - 20, 6, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('4. UPLOADED DOCUMENTS', 15, yPosition + 4.5);
            
            yPosition += 10;

            const documents = Object.entries(pdfContent.documents || {});
            
            const documentNames = {
                'passport_photo': 'Passport Photo',
                'aadhar_card': 'Aadhar Card',
                'birth_certificate': 'Birth Cert',
                'marksheet_10th': '10th Marksheet',
                'marksheet_12th': '12th Marksheet',
                'transfer_certificate': 'Transfer Cert',
                'caste_certificate': 'Caste Cert',
                'income_certificate': 'Income Cert',
                'resident_certificate': 'Resident Cert',
                'pm_kisan_enrollment': 'PM Kisan',
                'cm_kisan_enrollment': 'CM Kisan'
            };

            if (documents.length > 0) {
                // Compact two-column grid
                let currentPage = 1;
                documents.forEach(([key, doc], index) => {
                    const docName = documentNames[key] || key.replace(/_/g, ' ').substring(0, 15);
                    const col = index % 2;
                    const row = Math.floor(index / 2);
                    const boxWidth = (pageWidth - 30) / 2;
                    const boxHeight = 8;
                    const xPos = 12 + (col * (boxWidth + 6));
                    let currentY = yPosition + (row * 11);
                    
                    // Check if we need page 2
                    if (currentPage === 1 && currentY + boxHeight > maxYPage1) {
                        pdf.addPage();
                        currentPage = 2;
                        yPosition = 20;
                        currentY = yPosition + ((row % 4) * 10);
                    }
                    
                    // Compact document box
                    pdf.setDrawColor(200, 200, 200);
                    pdf.setLineWidth(0.3);
                    pdf.setFillColor(239, 246, 255);
                    pdf.rect(xPos, currentY, boxWidth, boxHeight, 'FD');
                    
                    pdf.setFillColor(37, 99, 235);
                    pdf.rect(xPos, currentY, 2, boxHeight, 'F');
                    
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(7);
                    pdf.setTextColor(25, 25, 25);
                    pdf.text(docName, xPos + 5, currentY + 3);
                    
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(6);
                    pdf.setTextColor(80, 80, 80);
                    const fileName = (doc.name || doc.fileName || 'Uploaded').substring(0, 25);
                    pdf.text(fileName, xPos + 5, currentY + 5.5);
                    
                    // Add clickable link if document URL is available
                    if (doc.downloadUrl || doc.url || doc.filePath) {
                        const docUrl = doc.downloadUrl || doc.url || doc.filePath;
                        // Make the entire box clickable
                        try {
                            pdf.link(xPos, currentY, boxWidth, boxHeight, {
                                url: docUrl
                            });
                        } catch (e) {
                            console.log('Link creation error:', e);
                        }
                    }
                });
                
                const totalRows = Math.ceil(documents.length / 2);
                yPosition += (totalRows * 11) + 7;
            } else {
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.text('No documents uploaded', pageWidth / 2, yPosition + 4, { align: 'center' });
                yPosition += 10;
            }

            // ============================================
            // SECTION 5: TERMS AND CONDITIONS (Compact)
            // ============================================
            
            // Check if we need to move to page 2
            if (yPosition > maxYPage1 - 60) {
                pdf.addPage();
                yPosition = 20;
            }

            // Compact section header
            pdf.setFillColor(147, 51, 234);
            pdf.rect(10, yPosition, pageWidth - 20, 6, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('5. TERMS AND CONDITIONS', 15, yPosition + 4.5);
            
            yPosition += 10;

            // Full terms and conditions as originally specified
            pdf.setFontSize(7);
            pdf.setTextColor(40, 40, 40);
            pdf.setFont('helvetica', 'normal');

            const terms = [
                { num: '1', text: 'Application Submission: I hereby declare that all information provided in this application is true and correct to the best of my knowledge.' },
                { num: '2', text: 'Document Verification: I understand that all submitted documents will be verified and any false information may result in rejection of the application.' },
                { num: '3', text: 'Fee Payment: I agree to pay all applicable fees as per the institution\'s fee structure and payment schedule.' },
                { num: '4', text: 'Academic Performance: I understand that admission is subject to meeting the minimum academic requirements and availability of seats.' },
                { num: '5', text: 'Code of Conduct: I agree to abide by the institution\'s rules, regulations, and code of conduct during my tenure.' },
                { num: '6', text: 'Data Privacy: I consent to the collection, processing, and storage of my personal data for academic and administrative purposes.' },
                { num: '7', text: 'Refund Policy: I understand the institution\'s refund policy and agree to the terms and conditions regarding fee refunds.' },
                { num: '8', text: 'Medical Fitness: I declare that I am medically fit to pursue the selected course and will provide medical certificates if required.' }
            ];

            let currentPage = pdf.internal.getNumberOfPages();
            terms.forEach((term, index) => {
                // Check if we need page 2
                if (currentPage === 1 && yPosition > maxYPage1 - 15) {
                    pdf.addPage();
                    currentPage = 2;
                    yPosition = 20;
                }
                
                // Term number
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(7);
                pdf.setTextColor(147, 51, 234);
                pdf.text(term.num + '.', 15, yPosition + 3);
                
                // Term text - split into multiple lines if needed
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(40, 40, 40);
                pdf.setFontSize(7);
                const maxWidth = pageWidth - 30;
                const lines = pdf.splitTextToSize(term.text, maxWidth);
                lines.forEach((line, lineIndex) => {
                    pdf.text(line, 20, yPosition + 3 + (lineIndex * 4));
                });
                
                yPosition += (lines.length * 4) + 3;
            });
            
            yPosition += 5;

            // ============================================
            // SIGNATURE SECTION (Compact)
            // ============================================
            
            // Check if we need page 2
            const currentPageNum = pdf.internal.getNumberOfPages();
            if (currentPageNum === 1 && yPosition > maxYPage1 - 25) {
                pdf.addPage();
                yPosition = 20;
            } else if (currentPageNum === 2 && yPosition > maxYPage2 - 25) {
                yPosition = maxYPage2 - 25;
            }

            // Compact signature section
            pdf.setFillColor(168, 85, 247);
            pdf.rect(10, yPosition, pageWidth - 20, 5, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SIGNATURES', 15, yPosition + 3.5);
            
            yPosition += 7;
            
            // Compact signature boxes
            const sigBoxWidth = (pageWidth - 30) / 2;
            const sigBoxHeight = 20;
            
            // Student signature box
            pdf.setDrawColor(200, 200, 200);
            pdf.setFillColor(255, 255, 255);
            pdf.setLineWidth(0.3);
            pdf.rect(12, yPosition, sigBoxWidth, sigBoxHeight, 'FD');
            
            pdf.setFillColor(79, 70, 229);
            pdf.rect(12, yPosition, sigBoxWidth, 2, 'F');
            
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 30, 30);
            pdf.text('Student', 12 + sigBoxWidth / 2, yPosition + 5, { align: 'center' });
            
            pdf.setDrawColor(150, 150, 150);
            pdf.setLineWidth(0.5);
            pdf.line(12 + 5, yPosition + 10, 12 + sigBoxWidth - 5, yPosition + 10);
            
            pdf.setFontSize(6);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text('Date: _______', 12 + sigBoxWidth / 2, yPosition + 15, { align: 'center' });
            
            // Parent/Guardian signature box
            pdf.setDrawColor(200, 200, 200);
            pdf.setFillColor(255, 255, 255);
            pdf.setLineWidth(0.3);
            pdf.rect(18 + sigBoxWidth, yPosition, sigBoxWidth, sigBoxHeight, 'FD');
            
            pdf.setFillColor(79, 70, 229);
            pdf.rect(18 + sigBoxWidth, yPosition, sigBoxWidth, 2, 'F');
            
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 30, 30);
            pdf.text('Parent/Guardian', 18 + sigBoxWidth + sigBoxWidth / 2, yPosition + 5, { align: 'center' });
            
            pdf.setDrawColor(150, 150, 150);
            pdf.setLineWidth(0.5);
            pdf.line(18 + sigBoxWidth + 5, yPosition + 10, 18 + sigBoxWidth + sigBoxWidth - 5, yPosition + 10);
            
            pdf.setFontSize(6);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text('Date: _______', 18 + sigBoxWidth + sigBoxWidth / 2, yPosition + 15, { align: 'center' });
            
            yPosition += sigBoxHeight + 5;

            // ============================================
            // ENHANCED FOOTER - Add to all pages (Max 2 pages)
            // ============================================
            
            // Ensure we only have 2 pages maximum
            const totalPagesCount = Math.min(pdf.internal.getNumberOfPages(), 2);
            
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
