// Face recognition runs entirely in the browser. The library (~1.3MB) and the
// model files in /public/models (~6.7MB) are only downloaded the first time a
// camera window opens, then stay cached for the session.
let enginePromise = null;

export const loadFaceEngine = () => {
    if (!enginePromise) {
        enginePromise = (async () => {
            const faceapi = await import('@vladmandic/face-api');
            await faceapi.tf.ready();
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            ]);
            return faceapi;
        })().catch((err) => {
            enginePromise = null; // allow a retry after a network failure
            throw err;
        });
    }
    return enginePromise;
};

// One detection with descriptor, or null when no clear face is in view
export const detectFace = async (faceapi, video) => {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
    const result = await faceapi
        .detectSingleFace(video, options)
        .withFaceLandmarks(true)
        .withFaceDescriptor();
    return result || null;
};

export const averageDescriptors = (list) => {
    const out = new Array(128).fill(0);
    list.forEach((d) => { for (let i = 0; i < 128; i += 1) out[i] += d[i] / list.length; });
    return out;
};

// Compressed JPEG of the current video frame (used for attendance proof)
export const snapshot = (video, maxWidth = 480) => new Promise((resolve) => {
    const scale = Math.min(1, maxWidth / (video.videoWidth || maxWidth));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round((video.videoWidth || maxWidth) * scale);
    canvas.height = Math.round((video.videoHeight || maxWidth) * scale);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
});
