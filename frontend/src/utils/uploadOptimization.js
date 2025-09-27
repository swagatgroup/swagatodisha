// Upload optimization utilities

// Compress image before upload
export const compressImage = (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/jpeg',
                quality
            );
        };

        img.src = URL.createObjectURL(file);
    });
};

// Validate file before upload
export const validateFile = (file, options = {}) => {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB
        allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
        allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
        errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        errors.push(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
        errors.push(`File extension not allowed. Allowed: ${allowedExtensions.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// Get file preview URL
export const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
    }
    return null;
};

// Format file size
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Upload progress tracker
export class UploadProgressTracker {
    constructor() {
        this.progress = 0;
        this.callbacks = [];
    }

    onProgress(callback) {
        this.callbacks.push(callback);
    }

    updateProgress(progress) {
        this.progress = progress;
        this.callbacks.forEach(callback => callback(progress));
    }

    reset() {
        this.progress = 0;
        this.callbacks = [];
    }
}

// Batch upload helper
export const createBatchUpload = (files, uploadFn, options = {}) => {
    const {
        maxConcurrent = 3,
        onProgress = () => { },
        onComplete = () => { },
        onError = () => { }
    } = options;

    const results = [];
    const errors = [];
    let completed = 0;

    const processBatch = async (fileBatch) => {
        const promises = fileBatch.map(async (file, index) => {
            try {
                const result = await uploadFn(file);
                results.push(result);
                completed++;
                onProgress(completed, files.length);
            } catch (error) {
                errors.push({ file, error });
                completed++;
                onProgress(completed, files.length);
            }
        });

        await Promise.all(promises);
    };

    const execute = async () => {
        // Split files into batches
        const batches = [];
        for (let i = 0; i < files.length; i += maxConcurrent) {
            batches.push(files.slice(i, i + maxConcurrent));
        }

        // Process batches sequentially
        for (const batch of batches) {
            await processBatch(batch);
        }

        onComplete(results, errors);
        return { results, errors };
    };

    return { execute };
};
