import { useState } from 'react';
import { DocumentIcon, EyeIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ApplicationPDFGenerator = ({ formData, application }) => {
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

            // Header
            pdf.setFontSize(20);
            pdf.setTextColor(99, 102, 241); // Purple color
            pdf.text('SWAGAT ODISHA', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            pdf.setFontSize(14);
            pdf.setTextColor(102, 102, 102);
            pdf.text('Student Application Form', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 8;

            pdf.setFontSize(10);
            pdf.text(`Application ID: ${pdfContent.applicationId}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 5;
            pdf.text(`Date: ${pdfContent.generatedDate}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Draw line
            pdf.setDrawColor(99, 102, 241);
            pdf.setLineWidth(0.5);
            pdf.line(20, yPosition, pageWidth - 20, yPosition);
            yPosition += 10;

            // Personal Details Section
            pdf.setFontSize(12);
            pdf.setTextColor(99, 102, 241);
            pdf.text('PERSONAL DETAILS', 20, yPosition);
            yPosition += 8;

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);

            const personalDetails = [
                ['Full Name:', pdfContent.personalDetails.fullName || 'N/A'],
                ['Date of Birth:', pdfContent.personalDetails.dateOfBirth || 'N/A'],
                ['Gender:', pdfContent.personalDetails.gender || 'N/A'],
                ['Aadhar Number:', pdfContent.personalDetails.aadharNumber || 'N/A'],
                ['Category:', pdfContent.personalDetails.category || 'N/A']
            ];

            personalDetails.forEach(([label, value]) => {
                pdf.setFont('helvetica', 'bold');
                pdf.text(label, 20, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(value, 60, yPosition);
                yPosition += 6;
            });

            yPosition += 5;

            // Contact Details Section
            pdf.setFontSize(12);
            pdf.setTextColor(99, 102, 241);
            pdf.text('CONTACT DETAILS', 20, yPosition);
            yPosition += 8;

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);

            const contactDetails = [
                ['Email:', pdfContent.contactDetails.email || 'N/A'],
                ['Phone:', pdfContent.contactDetails.primaryPhone || 'N/A'],
                ['WhatsApp:', pdfContent.contactDetails.whatsappNumber || 'N/A'],
                ['Address:', pdfContent.contactDetails.permanentAddress?.street || 'N/A'],
                ['City, State:', `${pdfContent.contactDetails.permanentAddress?.city || 'N/A'}, ${pdfContent.contactDetails.permanentAddress?.state || 'N/A'} - ${pdfContent.contactDetails.permanentAddress?.pincode || 'N/A'}`]
            ];

            contactDetails.forEach(([label, value]) => {
                pdf.setFont('helvetica', 'bold');
                pdf.text(label, 20, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(value, 60, yPosition);
                yPosition += 6;
            });

            yPosition += 5;

            // Family Details Section
            pdf.setFontSize(12);
            pdf.setTextColor(99, 102, 241);
            pdf.text('FAMILY DETAILS', 20, yPosition);
            yPosition += 8;

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);

            const familyDetails = [
                ['Father\'s Name:', pdfContent.personalDetails.fathersName || 'N/A'],
                ['Mother\'s Name:', pdfContent.personalDetails.mothersName || 'N/A'],
                ['Guardian Name:', pdfContent.guardianDetails.guardianName || 'N/A'],
                ['Relationship:', pdfContent.guardianDetails.relationship || 'N/A'],
                ['Guardian Phone:', pdfContent.guardianDetails.guardianPhone || 'N/A']
            ];

            familyDetails.forEach(([label, value]) => {
                pdf.setFont('helvetica', 'bold');
                pdf.text(label, 20, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(value, 60, yPosition);
                yPosition += 6;
            });

            yPosition += 5;

            // Academic Details Section
            pdf.setFontSize(12);
            pdf.setTextColor(99, 102, 241);
            pdf.text('ACADEMIC DETAILS', 20, yPosition);
            yPosition += 8;

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);

            const academicDetails = [
                ['Selected Course:', pdfContent.courseDetails.selectedCourse || 'N/A'],
                ['Stream:', pdfContent.courseDetails.stream || 'N/A']
            ];

            if (pdfContent.courseDetails.customCourse) {
                academicDetails.push(['Custom Course:', pdfContent.courseDetails.customCourse]);
            }

            if (pdfContent.referralCode) {
                academicDetails.push(['Referral Code:', pdfContent.referralCode]);
            }

            academicDetails.forEach(([label, value]) => {
                pdf.setFont('helvetica', 'bold');
                pdf.text(label, 20, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(value, 60, yPosition);
                yPosition += 6;
            });

            yPosition += 5;

            // Documents Section
            pdf.setFontSize(12);
            pdf.setTextColor(99, 102, 241);
            pdf.text('UPLOADED DOCUMENTS', 20, yPosition);
            yPosition += 8;

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);

            const documents = Object.entries(pdfContent.documents || {});
            if (documents.length > 0) {
                documents.forEach(([key, doc]) => {
                    const docName = key.replace(/_/g, ' ').toUpperCase();
                    const docInfo = `${doc.name || 'Uploaded'} ${doc.size ? '(' + (doc.size / 1024).toFixed(1) + ' KB)' : ''}`;

                    pdf.setFont('helvetica', 'bold');
                    pdf.text(docName + ':', 20, yPosition);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(docInfo, 20, yPosition + 4);
                    yPosition += 8;
                });
            } else {
                pdf.text('No documents uploaded', 20, yPosition);
                yPosition += 6;
            }

            yPosition += 10;

            // Terms and Conditions Section
            pdf.setFontSize(12);
            pdf.setTextColor(193, 86, 33); // Orange color
            pdf.text('TERMS AND CONDITIONS', 20, yPosition);
            yPosition += 8;

            pdf.setFontSize(9);
            pdf.setTextColor(116, 66, 16);

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

            // Footer
            yPosition = pageHeight - 20;
            pdf.setFontSize(8);
            pdf.setTextColor(113, 128, 150);
            pdf.text('Swagat Odisha - Educational Excellence', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 4;
            pdf.text('This application was generated electronically and is valid without physical signature.', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 4;
            pdf.text('For any queries, contact: support@swagatodisha.com | Phone: +91-XXX-XXXX-XXXX', pageWidth / 2, yPosition, { align: 'center' });

            // Generate PDF blob
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

        } catch (err) {
            console.error('PDF generation error:', err);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const createPDFContent = (formData, application) => {
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
                    <span class="field-label">Selected Course:</span>
                    <span class="field-value">${content.courseDetails.selectedCourse || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Stream:</span>
                    <span class="field-value">${content.courseDetails.stream || 'N/A'}</span>
                </div>
                ${content.courseDetails.customCourse ? `
                <div class="field-row">
                    <span class="field-label">Custom Course:</span>
                    <span class="field-value">${content.courseDetails.customCourse}</span>
                </div>
                ` : ''}
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
                                    <span className="font-medium">Course:</span> {formData.courseDetails.selectedCourse || 'N/A'}
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
