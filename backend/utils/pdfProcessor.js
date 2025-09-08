const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const multer = require('multer');

class PDFProcessor {
    constructor() {
        this.uploadDir = path.join(__dirname, '../uploads/documents');
        this.processedDir = path.join(__dirname, '../uploads/processed');
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.uploadDir, this.processedDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // Configure multer for file uploads
    getMulterConfig() {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
            }
        });

        const fileFilter = (req, file, cb) => {
            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/webp'
            ];

            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and WebP files are allowed.'), false);
            }
        };

        return multer({
            storage,
            fileFilter,
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB limit
            }
        });
    }

    // Convert image to PDF
    async convertImageToPDF(imagePath, outputPath) {
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([612, 792]); // Standard letter size

            // Convert image to buffer
            const imageBuffer = await sharp(imagePath)
                .resize(600, 800, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 90 })
                .toBuffer();

            // Embed image in PDF
            const image = await pdfDoc.embedJpg(imageBuffer);
            const { width, height } = image.scale(1);

            // Center the image on the page
            const x = (page.getWidth() - width) / 2;
            const y = (page.getHeight() - height) / 2;

            page.drawImage(image, {
                x,
                y,
                width,
                height
            });

            // Save PDF
            const pdfBytes = await pdfDoc.save();
            await fs.promises.writeFile(outputPath, pdfBytes);

            return outputPath;
        } catch (error) {
            console.error('Error converting image to PDF:', error);
            throw new Error('Failed to convert image to PDF');
        }
    }

    // Merge multiple PDFs
    async mergePDFs(pdfPaths, outputPath) {
        try {
            const mergedPdf = await PDFDocument.create();

            for (const pdfPath of pdfPaths) {
                if (!fs.existsSync(pdfPath)) {
                    console.warn(`PDF file not found: ${pdfPath}`);
                    continue;
                }

                const pdfBytes = await fs.promises.readFile(pdfPath);
                const pdf = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            await fs.promises.writeFile(outputPath, mergedPdfBytes);

            return outputPath;
        } catch (error) {
            console.error('Error merging PDFs:', error);
            throw new Error('Failed to merge PDFs');
        }
    }

    // Process student documents
    async processStudentDocuments(studentId, documents) {
        try {
            const studentDir = path.join(this.processedDir, studentId.toString());
            if (!fs.existsSync(studentDir)) {
                fs.mkdirSync(studentDir, { recursive: true });
            }

            const processedDocs = [];
            const pdfPaths = [];

            for (const doc of documents) {
                const docPath = path.join(this.uploadDir, doc.fileName);
                const outputPath = path.join(studentDir, `${doc.documentType}.pdf`);

                if (doc.mimeType === 'application/pdf') {
                    // Copy PDF directly
                    await fs.promises.copyFile(docPath, outputPath);
                    pdfPaths.push(outputPath);
                } else if (doc.mimeType.startsWith('image/')) {
                    // Convert image to PDF
                    await this.convertImageToPDF(docPath, outputPath);
                    pdfPaths.push(outputPath);
                }

                processedDocs.push({
                    ...doc,
                    pdfPath: outputPath,
                    isPdfGenerated: true
                });
            }

            // Merge all PDFs into one document
            const mergedPdfPath = path.join(studentDir, 'student-documents-merged.pdf');
            if (pdfPaths.length > 0) {
                await this.mergePDFs(pdfPaths, mergedPdfPath);
            }

            return {
                processedDocs,
                mergedPdfPath,
                studentDir
            };
        } catch (error) {
            console.error('Error processing student documents:', error);
            throw new Error('Failed to process student documents');
        }
    }

    // Generate document thumbnail
    async generateThumbnail(filePath, outputPath) {
        try {
            if (filePath.endsWith('.pdf')) {
                // For PDFs, we'll use the first page as thumbnail
                // This would require pdf2pic or similar library
                // For now, return the original path
                return filePath;
            } else {
                // For images, generate thumbnail
                await sharp(filePath)
                    .resize(300, 400, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toFile(outputPath);

                return outputPath;
            }
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return filePath; // Return original if thumbnail generation fails
        }
    }

    // Compress PDF
    async compressPDF(inputPath, outputPath) {
        try {
            const pdfBytes = await fs.promises.readFile(inputPath);
            const pdfDoc = await PDFDocument.load(pdfBytes);

            // Save with compression
            const compressedBytes = await pdfDoc.save({
                useObjectStreams: false,
                addDefaultPage: false,
                objectsPerTick: 50
            });

            await fs.promises.writeFile(outputPath, compressedBytes);
            return outputPath;
        } catch (error) {
            console.error('Error compressing PDF:', error);
            throw new Error('Failed to compress PDF');
        }
    }

    // Clean up temporary files
    async cleanupTempFiles(filePaths) {
        try {
            for (const filePath of filePaths) {
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath);
                }
            }
        } catch (error) {
            console.error('Error cleaning up temp files:', error);
        }
    }

    // Get file info
    async getFileInfo(filePath) {
        try {
            const stats = await fs.promises.stat(filePath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        } catch (error) {
            console.error('Error getting file info:', error);
            return null;
        }
    }
}

module.exports = new PDFProcessor();
