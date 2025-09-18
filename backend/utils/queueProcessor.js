const redisManager = require('../config/redis');
const Document = require('../models/Document');
const StudentApplication = require('../models/StudentApplication');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class QueueProcessor {
    constructor() {
        this.workers = new Map();
        this.isProcessing = false;
        this.initializeWorkers();
    }

    initializeWorkers() {
        // Document processing worker
        this.workers.set('document_processing', {
            processor: this.processDocumentUpload.bind(this),
            concurrency: 3,
            isRunning: false
        });

        // PDF generation worker
        this.workers.set('pdf_generation', {
            processor: this.processPDFGeneration.bind(this),
            concurrency: 2,
            isRunning: false
        });

        // Email notification worker
        this.workers.set('email_notifications', {
            processor: this.processEmailNotification.bind(this),
            concurrency: 5,
            isRunning: false
        });

        // Database cleanup worker
        this.workers.set('cleanup', {
            processor: this.processCleanup.bind(this),
            concurrency: 1,
            isRunning: false
        });
    }

    async startAllWorkers() {
        console.log('Starting all queue workers...');

        for (const [queueName, worker] of this.workers) {
            if (!worker.isRunning) {
                this.startWorker(queueName, worker);
            }
        }

        // Start cleanup worker (runs every hour)
        setInterval(() => {
            this.addToQueue('cleanup', { type: 'scheduled_cleanup' });
        }, 3600000); // 1 hour

        console.log('All queue workers started');
    }

    async startWorker(queueName, worker) {
        worker.isRunning = true;
        console.log(`Starting worker for queue: ${queueName}`);

        const processQueue = async () => {
            while (worker.isRunning) {
                try {
                    const result = await redisManager.processQueue(queueName, worker.processor);
                    if (!result) {
                        // No jobs available, wait a bit
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (error) {
                    console.error(`Worker error in ${queueName}:`, error);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        };

        // Start multiple concurrent workers
        for (let i = 0; i < worker.concurrency; i++) {
            processQueue();
        }
    }

    async stopWorker(queueName) {
        const worker = this.workers.get(queueName);
        if (worker) {
            worker.isRunning = false;
            console.log(`Stopped worker for queue: ${queueName}`);
        }
    }

    async stopAllWorkers() {
        for (const [queueName, worker] of this.workers) {
            worker.isRunning = false;
        }
        console.log('All workers stopped');
    }

    // Document processing worker
    async processDocumentUpload(jobData) {
        const { docType, documentData, submissionId, userId } = jobData;

        try {
            console.log(`Processing document: ${docType} for submission: ${submissionId}`);

            // Validate document data
            if (!documentData.file || !documentData.filePath) {
                throw new Error('Invalid document data: missing file or filePath');
            }

            // Create document record
            const document = new Document({
                fileName: documentData.fileName,
                filePath: documentData.filePath,
                fileSize: documentData.fileSize,
                mimeType: documentData.mimeType,
                documentType: docType,
                uploadedBy: userId,
                status: 'PENDING',
                submissionId: submissionId
            });

            await document.save();

            // Process file (resize, compress, etc.)
            const processedPath = await this.processFile(documentData.filePath, docType);

            // Update document with processed file
            document.processedPath = processedPath;
            document.status = 'PROCESSED';
            document.processedAt = new Date();
            await document.save();

            // Update application with document reference
            await this.updateApplicationWithDocument(submissionId, docType, document._id);

            // Publish document processed event
            await redisManager.publishEvent('document:processed', 'document_ready', {
                documentId: document._id,
                docType,
                submissionId,
                userId,
                processedAt: new Date()
            });

            return {
                documentId: document._id,
                docType,
                status: 'processed',
                processedAt: new Date()
            };

        } catch (error) {
            console.error(`Document processing failed for ${docType}:`, error);

            // Update document status to failed
            if (document) {
                document.status = 'FAILED';
                document.error = error.message;
                await document.save();
            }

            throw error;
        }
    }

    // PDF generation worker
    async processPDFGeneration(jobData) {
        const { applicationId, submissionId, userId } = jobData;

        try {
            console.log(`Generating PDF for application: ${applicationId}`);

            // Get application data
            const application = await StudentApplication.findOne({ applicationId })
                .populate('user', 'fullName email phoneNumber');

            if (!application) {
                throw new Error('Application not found');
            }

            // Generate PDF
            const pdfPath = await this.generateApplicationPDF(application);

            // Update application with PDF path
            application.pdfPath = pdfPath;
            application.progress.applicationPdfGenerated = true;
            await application.save();

            // Publish PDF generated event
            await redisManager.publishEvent('pdf:generated', 'pdf_ready', {
                applicationId,
                pdfPath,
                submissionId,
                userId,
                generatedAt: new Date()
            });

            return {
                applicationId,
                pdfPath,
                status: 'generated',
                generatedAt: new Date()
            };

        } catch (error) {
            console.error(`PDF generation failed for ${applicationId}:`, error);
            throw error;
        }
    }

    // Email notification worker
    async processEmailNotification(jobData) {
        const { type, recipient, data, submissionId } = jobData;

        try {
            console.log(`Sending email notification: ${type} to ${recipient}`);

            let emailResult;

            switch (type) {
                case 'application_submitted':
                    emailResult = await this.sendApplicationSubmittedEmail(recipient, data);
                    break;
                case 'application_approved':
                    emailResult = await this.sendApplicationApprovedEmail(recipient, data);
                    break;
                case 'application_rejected':
                    emailResult = await this.sendApplicationRejectedEmail(recipient, data);
                    break;
                case 'document_required':
                    emailResult = await this.sendDocumentRequiredEmail(recipient, data);
                    break;
                default:
                    throw new Error(`Unknown email type: ${type}`);
            }

            // Publish email sent event
            await redisManager.publishEvent('email:sent', 'notification_delivered', {
                type,
                recipient,
                submissionId,
                sentAt: new Date()
            });

            return {
                type,
                recipient,
                status: 'sent',
                sentAt: new Date()
            };

        } catch (error) {
            console.error(`Email notification failed for ${type}:`, error);
            throw error;
        }
    }

    // Cleanup worker
    async processCleanup(jobData) {
        const { type } = jobData;

        try {
            console.log(`Running cleanup: ${type}`);

            let cleanupResult;

            switch (type) {
                case 'scheduled_cleanup':
                    cleanupResult = await this.runScheduledCleanup();
                    break;
                case 'failed_jobs':
                    cleanupResult = await this.cleanupFailedJobs();
                    break;
                case 'expired_sessions':
                    cleanupResult = await this.cleanupExpiredSessions();
                    break;
                default:
                    throw new Error(`Unknown cleanup type: ${type}`);
            }

            return {
                type,
                status: 'completed',
                result: cleanupResult,
                cleanedAt: new Date()
            };

        } catch (error) {
            console.error(`Cleanup failed for ${type}:`, error);
            throw error;
        }
    }

    // File processing methods
    async processFile(filePath, docType) {
        // Create processed directory
        const processedDir = path.join(path.dirname(filePath), 'processed');
        if (!fs.existsSync(processedDir)) {
            fs.mkdirSync(processedDir, { recursive: true });
        }

        const fileName = path.basename(filePath);
        const processedPath = path.join(processedDir, `processed_${fileName}`);

        // For now, just copy the file (in production, you'd resize, compress, etc.)
        fs.copyFileSync(filePath, processedPath);

        return processedPath;
    }

    async generateApplicationPDF(application) {
        // Create PDFs directory
        const pdfsDir = path.join(__dirname, '../uploads/pdfs');
        if (!fs.existsSync(pdfsDir)) {
            fs.mkdirSync(pdfsDir, { recursive: true });
        }

        const pdfPath = path.join(pdfsDir, `application_${application.applicationId}.pdf`);

        // For now, create a simple text file (in production, use PDF generation library)
        const pdfContent = `
Application ID: ${application.applicationId}
Student Name: ${application.user.fullName}
Email: ${application.user.email}
Course: ${application.courseDetails.selectedCourse}
Submitted At: ${application.submittedAt}
        `;

        fs.writeFileSync(pdfPath, pdfContent);
        return pdfPath;
    }

    // Email methods
    async sendApplicationSubmittedEmail(recipient, data) {
        // Implement email sending logic here
        console.log(`Sending application submitted email to ${recipient}`);
        return { success: true };
    }

    async sendApplicationApprovedEmail(recipient, data) {
        console.log(`Sending application approved email to ${recipient}`);
        return { success: true };
    }

    async sendApplicationRejectedEmail(recipient, data) {
        console.log(`Sending application rejected email to ${recipient}`);
        return { success: true };
    }

    async sendDocumentRequiredEmail(recipient, data) {
        console.log(`Sending document required email to ${recipient}`);
        return { success: true };
    }

    // Cleanup methods
    async runScheduledCleanup() {
        const results = {
            expiredSessions: 0,
            failedJobs: 0,
            tempFiles: 0
        };

        // Clean up expired sessions
        results.expiredSessions = await this.cleanupExpiredSessions();

        // Clean up failed jobs older than 24 hours
        results.failedJobs = await this.cleanupFailedJobs();

        // Clean up temporary files
        results.tempFiles = await this.cleanupTempFiles();

        return results;
    }

    async cleanupExpiredSessions() {
        // Get all session keys
        const sessionKeys = await redisManager.smembers('active_sessions');
        let cleaned = 0;

        for (const sessionKey of sessionKeys) {
            const session = await redisManager.get(`session:${sessionKey}`);
            if (!session) {
                await redisManager.srem('active_sessions', sessionKey);
                cleaned++;
            }
        }

        return cleaned;
    }

    async cleanupFailedJobs() {
        // Get failed jobs older than 24 hours
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
        const failedJobs = await redisManager.zrangebyscore('failed_jobs', 0, cutoffTime);

        let cleaned = 0;
        for (const job of failedJobs) {
            await redisManager.zrem('failed_jobs', job);
            cleaned++;
        }

        return cleaned;
    }

    async cleanupTempFiles() {
        const tempDir = path.join(__dirname, '../uploads/temp');
        if (!fs.existsSync(tempDir)) return 0;

        const files = fs.readdirSync(tempDir);
        const cutoffTime = Date.now() - (2 * 60 * 60 * 1000); // 2 hours
        let cleaned = 0;

        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);

            if (stats.mtime.getTime() < cutoffTime) {
                fs.unlinkSync(filePath);
                cleaned++;
            }
        }

        return cleaned;
    }

    // Helper methods
    async updateApplicationWithDocument(submissionId, docType, documentId) {
        // Update application workflow state
        await redisManager.setWorkflowStep(submissionId, 'document_processing', 'completed', {
            docType,
            documentId,
            processedAt: Date.now()
        });
    }

    async addToQueue(queueName, jobData, priority = 0) {
        return await redisManager.addToQueue(queueName, jobData, priority);
    }

    // Queue monitoring
    async getQueueStats() {
        const stats = {};

        for (const [queueName, worker] of this.workers) {
            const fifoLength = await redisManager.llen(`${queueName}:fifo`);
            const priorityLength = await redisManager.zcard(`${queueName}:priority`);

            stats[queueName] = {
                fifoJobs: fifoLength,
                priorityJobs: priorityLength,
                totalJobs: fifoLength + priorityLength,
                isRunning: worker.isRunning,
                concurrency: worker.concurrency
            };
        }

        return stats;
    }

    // Health check
    async healthCheck() {
        const stats = await this.getQueueStats();
        const redisHealth = await redisManager.healthCheck();

        return {
            redis: redisHealth,
            workers: stats,
            timestamp: Date.now()
        };
    }
}

module.exports = new QueueProcessor();
