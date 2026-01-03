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

    const generatePDF = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Create a comprehensive PDF content
            const pdfContent = createPDFContent(formData, application);

            // Generate premium PDF using jsPDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPosition = 0;

            // Set premium fonts
            pdf.setFont('helvetica');

            // ============================================
            // PREMIUM PROFESSIONAL HEADER DESIGN
            // ============================================
            
            // Main header with premium gradient effect (simulated with layered rectangles)
            pdf.setFillColor(79, 70, 229); // Deep indigo
            pdf.rect(0, 0, pageWidth, 45, 'F');
            
            // Gradient effect layers
            pdf.setFillColor(99, 102, 241); // Medium purple
            pdf.rect(0, 0, pageWidth, 42, 'F');
            
            pdf.setFillColor(139, 92, 246); // Light purple
            pdf.rect(0, 0, pageWidth, 38, 'F');
            
            // Premium decorative top border
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pageWidth, 2, 'F');
            
            // Main logo/title area
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(28);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SWAGAT ODISHA', pageWidth / 2, 16, { align: 'center' });
            
            // Subtitle with elegant spacing
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(255, 255, 255, 0.9);
            pdf.text('Educational Excellence Platform', pageWidth / 2, 23, { align: 'center' });
            
            // Form title with premium styling
            pdf.setFontSize(13);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('STUDENT APPLICATION FORM', pageWidth / 2, 30, { align: 'center' });
            
            // Premium info badges
            pdf.setFillColor(255, 255, 255, 0.2);
            pdf.rect(15, 34, 85, 8, 'F');
            pdf.rect(pageWidth - 100, 34, 85, 8, 'F');
            
            // Border for badges
            pdf.setDrawColor(255, 255, 255, 0.4);
            pdf.setLineWidth(0.5);
            pdf.rect(15, 34, 85, 8, 'D');
            pdf.rect(pageWidth - 100, 34, 85, 8, 'D');
            
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(255, 255, 255);
            pdf.text(`Application ID: ${pdfContent.applicationId}`, 20, 38.5);
            pdf.text(`Generated: ${pdfContent.generatedDate}`, pageWidth - 20, 38.5, { align: 'right' });
            
            // Premium decorative bottom border
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 45, pageWidth, 1, 'F');
            
            yPosition = 55;

            // ============================================
            // PREMIUM SECTION 1: PERSONAL DETAILS
            // ============================================
            
            // Premium section header with elegant design
            pdf.setFillColor(79, 70, 229); // Deep indigo
            pdf.rect(15, yPosition - 3, pageWidth - 30, 12, 'F');
            
            // Premium accent stripe
            pdf.setFillColor(255, 255, 255);
            pdf.rect(15, yPosition - 3, 5, 12, 'F');
            
            // Section number badge
            pdf.setFillColor(255, 255, 255);
            pdf.circle(20, yPosition + 3, 4, 'F');
            pdf.setTextColor(79, 70, 229);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('1', 20, yPosition + 4.5, { align: 'center' });
            
            // Section title
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(15);
            pdf.setFont('helvetica', 'bold');
            pdf.text('PERSONAL DETAILS', 30, yPosition + 5);
            
            yPosition += 15;
            
            // Premium content container - start position
            let personalStartY = yPosition;
            yPosition += 5;

            // Beautiful personal details with better formatting
            const personalDetails = [
                { label: 'Full Name', value: pdfContent.personalDetails.fullName || 'N/A', icon: '👤' },
                { label: 'Date of Birth', value: pdfContent.personalDetails.dateOfBirth || 'N/A', icon: '📅' },
                { label: 'Gender', value: pdfContent.personalDetails.gender || 'N/A', icon: '⚧' },
                { label: 'Aadhar Number', value: pdfContent.personalDetails.aadharNumber || 'N/A', icon: '🆔' },
                { label: 'Category', value: pdfContent.personalDetails.status || pdfContent.personalDetails.category || 'N/A', icon: '📋' },
                { label: 'Father\'s Name', value: pdfContent.personalDetails.fathersName || 'N/A', icon: '👨' },
                { label: 'Mother\'s Name', value: pdfContent.personalDetails.mothersName || 'N/A', icon: '👩' }
            ];

            personalDetails.forEach((item, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 25) {
                    pdf.addPage();
                    yPosition = 20;
                    personalStartY = yPosition;
                }
                
                // Premium row design with subtle background
                const rowHeight = 9;
                if (index % 2 === 0) {
                    pdf.setFillColor(255, 255, 255);
                } else {
                    pdf.setFillColor(249, 250, 251);
                }
                pdf.rect(18, yPosition, pageWidth - 36, rowHeight, 'F');
                
                // Premium left accent bar
                pdf.setFillColor(79, 70, 229);
                pdf.rect(18, yPosition, 2, rowHeight, 'F');
                
                // Icon circle
                pdf.setFillColor(99, 102, 241);
                pdf.circle(24, yPosition + 4.5, 2.5, 'F');
                
                // Label with premium typography
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 30, 30);
                pdf.setFontSize(10);
                pdf.text(item.label, 30, yPosition + 4);
                
                // Value with text wrapping and premium styling
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(60, 60, 60);
                pdf.setFontSize(10);
                const valueX = 80;
                const maxWidth = pageWidth - valueX - 25;
                
                // Split long text into multiple lines
                const valueLines = pdf.splitTextToSize(item.value || 'N/A', maxWidth);
                valueLines.forEach((line, lineIndex) => {
                    pdf.text(line, valueX, yPosition + 4 + (lineIndex * 5));
                });
                
                // Premium divider line
                pdf.setDrawColor(230, 230, 230);
                pdf.setLineWidth(0.3);
                pdf.line(20, yPosition + rowHeight, pageWidth - 20, yPosition + rowHeight);
                
                // Adjust yPosition based on number of lines
                yPosition += Math.max(rowHeight, valueLines.length * 5 + 1);
            });

            // Close premium content box - draw border only (no fill to avoid covering content)
            const personalHeight = yPosition - personalStartY + 5;
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(1);
            pdf.rect(15, personalStartY, pageWidth - 30, personalHeight, 'D');
            
            yPosition += 10;

            // ============================================
            // PREMIUM SECTION 2: CONTACT DETAILS
            // ============================================
            
            // Check if we need a new page
            if (yPosition > pageHeight - 100) {
                pdf.addPage();
                yPosition = 20;
            }

            // Premium section header
            pdf.setFillColor(5, 150, 105); // Premium green
            pdf.rect(15, yPosition - 3, pageWidth - 30, 12, 'F');
            
            // Premium accent stripe
            pdf.setFillColor(255, 255, 255);
            pdf.rect(15, yPosition - 3, 5, 12, 'F');
            
            // Section number badge
            pdf.setFillColor(255, 255, 255);
            pdf.circle(20, yPosition + 3, 4, 'F');
            pdf.setTextColor(5, 150, 105);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('2', 20, yPosition + 4.5, { align: 'center' });
            
            // Section title
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(15);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CONTACT DETAILS', 30, yPosition + 5);
            
            yPosition += 15;
            
            let contactStartY = yPosition;

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            yPosition += 5;

            const contactDetails = [
                { label: 'Email', value: pdfContent.contactDetails.email || 'N/A', icon: '📧' },
                { label: 'Primary Phone', value: pdfContent.contactDetails.primaryPhone || 'N/A', icon: '📱' },
                { label: 'WhatsApp', value: pdfContent.contactDetails.whatsappNumber || 'N/A', icon: '💬' },
                { label: 'Street Address', value: pdfContent.contactDetails.permanentAddress?.street || 'N/A', icon: '📍' },
                { label: 'City', value: pdfContent.contactDetails.permanentAddress?.city || 'N/A', icon: '🏙️' },
                { label: 'State', value: pdfContent.contactDetails.permanentAddress?.state || 'N/A', icon: '🗺️' },
                { label: 'Pincode', value: pdfContent.contactDetails.permanentAddress?.pincode || 'N/A', icon: '📮' }
            ];

            contactDetails.forEach((item, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 25) {
                    pdf.addPage();
                    yPosition = 20;
                    contactStartY = yPosition;
                }
                
                // Premium row design
                const rowHeight = 9;
                if (index % 2 === 0) {
                    pdf.setFillColor(255, 255, 255);
                } else {
                    pdf.setFillColor(240, 253, 250);
                }
                pdf.rect(18, yPosition, pageWidth - 36, rowHeight, 'F');
                
                // Premium left accent bar
                pdf.setFillColor(5, 150, 105);
                pdf.rect(18, yPosition, 2, rowHeight, 'F');
                
                // Icon circle
                pdf.setFillColor(16, 185, 129);
                pdf.circle(24, yPosition + 4.5, 2.5, 'F');
                
                // Label
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 30, 30);
                pdf.setFontSize(10);
                pdf.text(item.label, 30, yPosition + 4);
                
                // Value with wrapping
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(60, 60, 60);
                pdf.setFontSize(10);
                const valueX = 80;
                const maxWidth = pageWidth - valueX - 25;
                
                const valueLines = pdf.splitTextToSize(item.value || 'N/A', maxWidth);
                valueLines.forEach((line, lineIndex) => {
                    pdf.text(line, valueX, yPosition + 4 + (lineIndex * 5));
                });
                
                // Premium divider
                pdf.setDrawColor(230, 230, 230);
                pdf.setLineWidth(0.3);
                pdf.line(20, yPosition + rowHeight, pageWidth - 20, yPosition + rowHeight);
                
                yPosition += Math.max(rowHeight, valueLines.length * 5 + 1);
            });

            // Close premium content box - draw border only
            const contactHeight = yPosition - contactStartY + 5;
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(1);
            pdf.rect(15, contactStartY, pageWidth - 30, contactHeight, 'D');
            
            yPosition += 15;

            // Check if we need a new page
            if (yPosition > pageHeight - 100) {
                pdf.addPage();
                yPosition = 30;
            }

            // ============================================
            // PREMIUM SECTION 3: FAMILY & ACADEMIC DETAILS
            // ============================================
            
            // Check if we need a new page
            if (yPosition > pageHeight - 100) {
                pdf.addPage();
                yPosition = 20;
            }

            // Premium section header
            pdf.setFillColor(234, 88, 12); // Premium orange
            pdf.rect(15, yPosition - 3, pageWidth - 30, 12, 'F');
            
            // Premium accent stripe
            pdf.setFillColor(255, 255, 255);
            pdf.rect(15, yPosition - 3, 5, 12, 'F');
            
            // Section number badge
            pdf.setFillColor(255, 255, 255);
            pdf.circle(20, yPosition + 3, 4, 'F');
            pdf.setTextColor(234, 88, 12);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('3', 20, yPosition + 4.5, { align: 'center' });
            
            // Section title
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(15);
            pdf.setFont('helvetica', 'bold');
            pdf.text('FAMILY & ACADEMIC DETAILS', 30, yPosition + 5);
            
            yPosition += 15;
            
            let familyStartY = yPosition;

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            yPosition += 5;

            // Get college name if available
            const collegeName = pdfContent.courseDetails.selectedCollege 
                ? (colleges?.find(c => c._id === pdfContent.courseDetails.selectedCollege)?.name || 'N/A')
                : (pdfContent.courseDetails.institutionName || 'N/A');

            const familyDetails = [
                { label: 'Father\'s Name', value: pdfContent.personalDetails.fathersName || 'N/A', icon: '👨' },
                { label: 'Mother\'s Name', value: pdfContent.personalDetails.mothersName || 'N/A', icon: '👩' },
                { label: 'Guardian Name', value: pdfContent.guardianDetails.guardianName || 'N/A', icon: '👤' },
                { label: 'Relationship', value: pdfContent.guardianDetails.relationship || 'N/A', icon: '🔗' },
                { label: 'Guardian Phone', value: pdfContent.guardianDetails.guardianPhone || 'N/A', icon: '📞' },
                { label: 'Guardian Email', value: pdfContent.guardianDetails.guardianEmail || 'N/A', icon: '✉️' },
                { label: 'College Name', value: collegeName, icon: '🏫' },
                { label: 'Course Name', value: pdfContent.courseDetails.selectedCourse || pdfContent.courseDetails.courseName || 'N/A', icon: '📚' },
                { label: 'Stream', value: pdfContent.courseDetails.stream || 'N/A', icon: '📖' }
            ];

            familyDetails.forEach((item, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 25) {
                    pdf.addPage();
                    yPosition = 20;
                    familyStartY = yPosition;
                }
                
                // Premium row design
                const rowHeight = 9;
                if (index % 2 === 0) {
                    pdf.setFillColor(255, 255, 255);
                } else {
                    pdf.setFillColor(255, 247, 237);
                }
                pdf.rect(18, yPosition, pageWidth - 36, rowHeight, 'F');
                
                // Premium left accent bar
                pdf.setFillColor(234, 88, 12);
                pdf.rect(18, yPosition, 2, rowHeight, 'F');
                
                // Icon circle
                pdf.setFillColor(251, 146, 60);
                pdf.circle(24, yPosition + 4.5, 2.5, 'F');
                
                // Label
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 30, 30);
                pdf.setFontSize(10);
                pdf.text(item.label, 30, yPosition + 4);
                
                // Value with wrapping
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(60, 60, 60);
                pdf.setFontSize(10);
                const valueX = 80;
                const maxWidth = pageWidth - valueX - 25;
                
                const valueLines = pdf.splitTextToSize(item.value || 'N/A', maxWidth);
                valueLines.forEach((line, lineIndex) => {
                    pdf.text(line, valueX, yPosition + 4 + (lineIndex * 5));
                });
                
                // Premium divider
                pdf.setDrawColor(230, 230, 230);
                pdf.setLineWidth(0.3);
                pdf.line(20, yPosition + rowHeight, pageWidth - 20, yPosition + rowHeight);
                
                yPosition += Math.max(rowHeight, valueLines.length * 5 + 1);
            });

            // Close premium content box - draw border only
            const familyHeight = yPosition - familyStartY + 5;
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(1);
            pdf.rect(15, familyStartY, pageWidth - 30, familyHeight, 'D');
            
            yPosition += 15;

            // Premium Referral Code Badge
            if (pdfContent.referralCode) {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;
                }
                
                yPosition += 5;
                // Premium badge design
                pdf.setFillColor(168, 85, 247); // Purple
                pdf.rect(15, yPosition, pageWidth - 30, 10, 'F');
                
                // Decorative left border
                pdf.setFillColor(192, 132, 252);
                pdf.rect(15, yPosition, 4, 10, 'F');
                
                // Icon and label
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(11);
                pdf.text('🎁 Referral Code', 22, yPosition + 6);
                
                // Code value in premium style
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text(pdfContent.referralCode, 80, yPosition + 6);
                
                yPosition += 12;
            }

            yPosition += 5;

            // Check if we need a new page
            if (yPosition > pageHeight - 80) {
                pdf.addPage();
                yPosition = 30;
            }

            // ============================================
            // PREMIUM SECTION 4: UPLOADED DOCUMENTS
            // ============================================
            
            // Check if we need a new page
            if (yPosition > pageHeight - 80) {
                pdf.addPage();
                yPosition = 20;
            }

            // Premium section header
            pdf.setFillColor(37, 99, 235); // Premium blue
            pdf.rect(15, yPosition - 3, pageWidth - 30, 12, 'F');
            
            // Premium accent stripe
            pdf.setFillColor(255, 255, 255);
            pdf.rect(15, yPosition - 3, 5, 12, 'F');
            
            // Section number badge
            pdf.setFillColor(255, 255, 255);
            pdf.circle(20, yPosition + 3, 4, 'F');
            pdf.setTextColor(37, 99, 235);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('4', 20, yPosition + 4.5, { align: 'center' });
            
            // Section title
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(15);
            pdf.setFont('helvetica', 'bold');
            pdf.text('UPLOADED DOCUMENTS', 30, yPosition + 5);
            
            yPosition += 15;

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
                yPosition += 5;
                const docsStartY = yPosition;
                
                // Use beautiful grid layout with boxes
                documents.forEach(([key, doc], index) => {
                    console.log(`Document ${index + 1}: key="${key}", doc=`, doc);
                    const docName = documentNames[key] || key.replace(/_/g, ' ').toUpperCase();
                    const fileName = doc.name || doc.fileName || 'Not Uploaded';
                    const fileSize = doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'N/A';
                    console.log(`  → docName: "${docName}", fileName: "${fileName}", fileSize: "${fileSize}"`);
                    
                    // Two-column layout
                    const col = index % 2;
                    const row = Math.floor(index / 2);
                    const boxWidth = (pageWidth - 50) / 2;
                    const boxHeight = 12;
                    const xPos = 20 + (col * (boxWidth + 10));
                    let currentY = yPosition + (row * 15);
                    
                    // Check if we need a new page
                    if (row > 0 && col === 0 && currentY + boxHeight > pageHeight - 80) {
                        pdf.addPage();
                        yPosition = 30;
                        currentY = yPosition + (row % 5 * 15);
                    }
                    
                    // Premium document card design
                    pdf.setDrawColor(200, 200, 200);
                    pdf.setLineWidth(0.6);
                    pdf.setFillColor(240, 248, 255); // Light blue background
                    pdf.rect(xPos, currentY, boxWidth, boxHeight, 'FD');
                    
                    // Premium left accent bar
                    pdf.setFillColor(37, 99, 235);
                    pdf.rect(xPos, currentY, 3, boxHeight, 'F');
                    
                    // Premium document icon circle
                    pdf.setFillColor(59, 130, 246);
                    pdf.circle(xPos + 8, currentY + 6, 3.5, 'F');
                    pdf.setFillColor(255, 255, 255);
                    pdf.circle(xPos + 8, currentY + 6, 2, 'F');
                    
                    // Document name with premium typography
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(9);
                    pdf.setTextColor(20, 20, 20);
                    const docNameLines = pdf.splitTextToSize(docName, boxWidth - 20);
                    docNameLines.forEach((line, idx) => {
                        pdf.text(line, xPos + 14, currentY + 4 + (idx * 4));
                    });
                    
                    // File name with elegant styling
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(7);
                    pdf.setTextColor(80, 80, 80);
                    const fileNameLines = pdf.splitTextToSize(fileName, boxWidth - 20);
                    const startY = currentY + 4 + (docNameLines.length * 4);
                    fileNameLines.forEach((line, idx) => {
                        pdf.text(line, xPos + 14, startY + (idx * 3));
                    });
                    
                    // Premium file size badge
                    pdf.setFillColor(37, 99, 235);
                    pdf.rect(xPos + boxWidth - 32, currentY + boxHeight - 6, 30, 5, 'F');
                    pdf.setFontSize(6);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(255, 255, 255);
                    pdf.text(fileSize, xPos + boxWidth - 17, currentY + boxHeight - 3, { align: 'center' });
                    
                    // Clickable link if available
                    if (doc.downloadUrl || doc.filePath) {
                        pdf.link(xPos, currentY, boxWidth, boxHeight, {
                            url: doc.downloadUrl || doc.filePath
                        });
                    }
                });
                
                // Update yPosition for next section
                const totalRows = Math.ceil(documents.length / 2);
                yPosition = docsStartY + (totalRows * 15) + 5;
            } else {
                pdf.setFillColor(255, 250, 250);
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.5);
                pdf.rect(20, yPosition, pageWidth - 40, 10, 'FD');
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(150, 150, 150);
                pdf.text('No documents uploaded yet', pageWidth / 2, yPosition + 6, { align: 'center' });
                yPosition += 12;
            }

            yPosition += 10;

            // Check if we need a new page
            if (yPosition > pageHeight - 120) {
                pdf.addPage();
                yPosition = 30;
            }

            // ============================================
            // PREMIUM SECTION 5: TERMS AND CONDITIONS
            // ============================================
            
            // Check if we need a new page
            if (yPosition > pageHeight - 120) {
                pdf.addPage();
                yPosition = 20;
            }

            // Premium section header
            pdf.setFillColor(147, 51, 234); // Deep purple
            pdf.rect(15, yPosition - 3, pageWidth - 30, 12, 'F');
            
            // Premium accent stripe
            pdf.setFillColor(255, 255, 255);
            pdf.rect(15, yPosition - 3, 5, 12, 'F');
            
            // Section number badge
            pdf.setFillColor(255, 255, 255);
            pdf.circle(20, yPosition + 3, 4, 'F');
            pdf.setTextColor(147, 51, 234);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('5', 20, yPosition + 4.5, { align: 'center' });
            
            // Section title
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(15);
            pdf.setFont('helvetica', 'bold');
            pdf.text('TERMS AND CONDITIONS', 30, yPosition + 5);
            
            yPosition += 15;

            // Premium terms content box
            pdf.setDrawColor(200, 200, 200);
            pdf.setFillColor(250, 245, 255);
            const termsStartY = yPosition;
            yPosition += 8;

            pdf.setFontSize(9);
            pdf.setTextColor(30, 30, 30);

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

            terms.forEach((term, index) => {
                if (yPosition > pageHeight - 50) {
                    pdf.addPage();
                    yPosition = 20;
                }
                
                // Premium term number badge
                pdf.setFillColor(147, 51, 234);
                pdf.circle(25, yPosition + 1, 5, 'F');
                pdf.setFillColor(255, 255, 255);
                pdf.circle(25, yPosition + 1, 3.5, 'F');
                pdf.setTextColor(147, 51, 234);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                pdf.text(term.num, 25, yPosition + 2.5, { align: 'center' });
                
                // Term text with premium styling
                pdf.setTextColor(40, 40, 40);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(9);
                const lines = pdf.splitTextToSize(term.text, pageWidth - 50);
                lines.forEach((line, lineIndex) => {
                    pdf.text(line, 35, yPosition + 2 + (lineIndex * 5));
                });
                
                yPosition += (lines.length * 5) + 4;
                
                // Premium separator line
                if (index < terms.length - 1) {
                    pdf.setDrawColor(220, 220, 220);
                    pdf.setLineWidth(0.3);
                    pdf.line(25, yPosition, pageWidth - 25, yPosition);
                    yPosition += 3;
                }
            });

            // Close premium terms box - draw border only
            const termsHeight = yPosition - termsStartY + 5;
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(1);
            pdf.rect(15, termsStartY, pageWidth - 30, termsHeight, 'D');
            
            yPosition += 15;

            // Check if we need a new page for signatures
            if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = 30;
            }

            // ============================================
            // PREMIUM SIGNATURE SECTION
            // ============================================
            
            // Check if we need a new page
            if (yPosition > pageHeight - 70) {
                pdf.addPage();
                yPosition = 20;
            }

            yPosition += 10;
            
            // Premium signature boxes
            const sigBoxWidth = (pageWidth - 50) / 2;
            const sigBoxHeight = 30;
            const gap = 10;
            
            // Student signature box - Premium design
            pdf.setDrawColor(200, 200, 200);
            pdf.setFillColor(255, 255, 255);
            pdf.setLineWidth(1);
            pdf.rect(20, yPosition, sigBoxWidth, sigBoxHeight, 'FD');
            
            // Premium top accent
            pdf.setFillColor(79, 70, 229);
            pdf.rect(20, yPosition, sigBoxWidth, 3, 'F');
            
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 30, 30);
            pdf.text('Student Signature', 20 + sigBoxWidth / 2, yPosition + 8, { align: 'center' });
            
            // Premium signature line
            pdf.setDrawColor(150, 150, 150);
            pdf.setLineWidth(0.8);
            pdf.line(20 + 10, yPosition + 15, 20 + sigBoxWidth - 10, yPosition + 15);
            
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text('Date: _______________', 20 + sigBoxWidth / 2, yPosition + 22, { align: 'center' });
            
            // Parent/Guardian signature box - Premium design
            pdf.setDrawColor(200, 200, 200);
            pdf.setFillColor(255, 255, 255);
            pdf.setLineWidth(1);
            pdf.rect(30 + sigBoxWidth, yPosition, sigBoxWidth, sigBoxHeight, 'FD');
            
            // Premium top accent
            pdf.setFillColor(79, 70, 229);
            pdf.rect(30 + sigBoxWidth, yPosition, sigBoxWidth, 3, 'F');
            
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 30, 30);
            pdf.text('Parent/Guardian Signature', 30 + sigBoxWidth + sigBoxWidth / 2, yPosition + 8, { align: 'center' });
            
            // Premium signature line
            pdf.setDrawColor(150, 150, 150);
            pdf.setLineWidth(0.8);
            pdf.line(30 + sigBoxWidth + 10, yPosition + 15, 30 + sigBoxWidth + sigBoxWidth - 10, yPosition + 15);
            
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text('Date: _______________', 30 + sigBoxWidth + sigBoxWidth / 2, yPosition + 22, { align: 'center' });
            
            yPosition += sigBoxHeight + 15;

            // ============================================
            // PREMIUM PROFESSIONAL FOOTER
            // ============================================
            
            // Premium footer with elegant design
            pdf.setFillColor(79, 70, 229); // Deep indigo
            pdf.rect(0, pageHeight - 35, pageWidth, 35, 'F');
            
            // Premium gradient layers
            pdf.setFillColor(99, 102, 241);
            pdf.rect(0, pageHeight - 35, pageWidth, 32, 'F');
            
            pdf.setFillColor(139, 92, 246);
            pdf.rect(0, pageHeight - 35, pageWidth, 28, 'F');
            
            // Premium top border
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, pageHeight - 35, pageWidth, 1, 'F');
            
            // Company name with premium styling
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SWAGAT ODISHA', pageWidth / 2, pageHeight - 28, { align: 'center' });
            
            // Tagline
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(255, 255, 255, 0.9);
            pdf.text('Educational Excellence Platform', pageWidth / 2, pageHeight - 23, { align: 'center' });
            
            // Application info in premium style
            pdf.setFontSize(7);
            pdf.setTextColor(255, 255, 255, 0.8);
            pdf.text(`Application ID: ${pdfContent.applicationId} | Generated: ${pdfContent.generatedDate}`, pageWidth / 2, pageHeight - 17, { align: 'center' });
            
            // Premium decorative divider
            pdf.setDrawColor(255, 255, 255, 0.3);
            pdf.setLineWidth(0.5);
            pdf.line(20, pageHeight - 12, pageWidth - 20, pageHeight - 12);
            
            // Contact information
            pdf.setFontSize(6);
            pdf.setTextColor(255, 255, 255, 0.7);
            pdf.text('Website: www.swagatodisha.com | Email: contact@swagatodisha.com | Phone: +91-XXX-XXXX-XXXX', pageWidth / 2, pageHeight - 7, { align: 'center' });
            
            // Premium bottom border
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, pageHeight - 1, pageWidth, 1, 'F');

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
