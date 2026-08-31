/**
 * Compresses an image file in the browser using the Canvas API.
 * Converts to WebP format and targets < 100KB size.
 *
 * @param {File} file - The image file to compress
 * @returns {Promise<File>} - A promise that resolves to the compressed WebP file
 */
export const compressImageToWebP = (file) => {
    return new Promise((resolve, reject) => {
        if (!file.type.match(/image.*/)) {
            reject(new Error("File is not an image"));
            return;
        }

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimensions to help compression
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Start with good quality and compress to WebP
                let quality = 0.8;
                let dataUrl = canvas.toDataURL('image/webp', quality);
                
                // If the resulting file is likely over 100KB (approx 133KB in base64), drop quality
                let iterations = 0;
                while (dataUrl.length > 133000 && iterations < 5) {
                    quality -= 0.15;
                    if (quality < 0.1) quality = 0.1;
                    dataUrl = canvas.toDataURL('image/webp', quality);
                    iterations++;
                }

                // Convert base64 to File object
                fetch(dataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const compressedFile = new File([blob], newName, {
                            type: 'image/webp',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    })
                    .catch(reject);
            };
            img.onerror = reject;
            img.src = readerEvent.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
