import { useEffect, useRef, useState, useCallback } from 'react';
import Modal from '../site/Modal';
import { loadFaceEngine, detectFace, averageDescriptors, snapshot } from '../../utils/faceEngine';

const STATUS_TEXT = {
    loading: 'Starting camera…',
    searching: 'Position your face in the frame',
    close: 'Move a little closer',
    steady: 'Hold steady…',
    processing: 'Checking…',
    success: 'Face verified!',
};

const cameraError = (err) => {
    if (typeof window !== 'undefined' && !window.isSecureContext) return 'The camera needs a secure (https) connection.';
    if (!navigator.mediaDevices?.getUserMedia) return 'This browser cannot open the camera. Please use Chrome or Safari.';
    if (err?.name === 'NotAllowedError') return 'Camera permission was denied. Allow camera access in your browser settings, then try again.';
    if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') return 'No camera was found on this device.';
    if (err?.name === 'NotReadableError') return 'The camera is being used by another app. Close it and try again.';
    return 'Could not start face recognition. Check your internet connection and try again.';
};

/**
 * Camera window that finds a face and hands back its 128-number descriptor.
 * - samples: how many good frames to average (3 when registering, 1 when verifying)
 * - onCapture({ descriptor, blob }) must return { ok, message } (blob = compressed JPEG)
 */
const CameraBody = ({ samples, onCapture, onDone, successText }) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const engineRef = useRef(null);
    const runRef = useRef(0);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [box, setBox] = useState(null);
    // Kept in refs so a parent re-render never restarts the camera
    const onCaptureRef = useRef(onCapture);
    const onDoneRef = useRef(onDone);
    onCaptureRef.current = onCapture;
    onDoneRef.current = onDone;

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    }, []);

    const scan = useCallback(async () => {
        const run = ++runRef.current;
        const faceapi = engineRef.current;
        const video = videoRef.current;
        const collected = [];
        let streak = 0;
        setError('');
        setStatus('searching');

        while (run === runRef.current && video && streamRef.current) {
            let result = null;
            try { result = await detectFace(faceapi, video); } catch { result = null; }
            if (run !== runRef.current) return;

            if (!result) {
                streak = 0;
                setBox(null);
                setStatus('searching');
            } else {
                const { x, y, width, height } = result.detection.box;
                const vw = video.videoWidth || 1;
                const vh = video.videoHeight || 1;
                setBox({ left: (x / vw) * 100, top: (y / vh) * 100, width: (width / vw) * 100, height: (height / vh) * 100 });
                if (width / vw < 0.22) {
                    streak = 0;
                    setStatus('close');
                } else {
                    streak += 1;
                    setStatus('steady');
                    // Two good frames in a row before each sample keeps blurry captures out
                    if (streak >= 2) {
                        collected.push(Array.from(result.descriptor));
                        streak = 0;
                    }
                }
            }

            if (collected.length >= samples) break;
            await new Promise((r) => setTimeout(r, 250));
        }
        if (run !== runRef.current || collected.length < samples) return;

        setStatus('processing');
        const descriptor = samples > 1 ? averageDescriptors(collected) : collected[0];
        const blob = await snapshot(video);
        let outcome;
        try {
            outcome = await onCaptureRef.current({ descriptor, blob });
        } catch (err) {
            outcome = { ok: false, message: err?.response?.data?.message || 'Something went wrong. Please try again.' };
        }
        if (run !== runRef.current) return;
        if (outcome?.ok) {
            setStatus('success');
            stopCamera();
            setTimeout(() => onDoneRef.current?.(outcome), 900);
        } else {
            setError(outcome?.message || 'Face did not match. Please try again.');
        }
    }, [samples, stopCamera]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
                const [faceapi, stream] = await Promise.all([
                    loadFaceEngine(),
                    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }),
                ]);
                if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
                engineRef.current = faceapi;
                streamRef.current = stream;
                const video = videoRef.current;
                video.srcObject = stream;
                await video.play().catch(() => {});
                if (!video.videoWidth) await new Promise((r) => video.addEventListener('loadedmetadata', r, { once: true }));
                if (!cancelled) scan();
            } catch (err) {
                if (!cancelled) setError(cameraError(err));
            }
        })();
        return () => {
            cancelled = true;
            runRef.current += 1; // stops the scan loop
            stopCamera();
        };
    }, [scan, stopCamera]);

    const ringColour = status === 'success' ? 'border-green-500' : status === 'steady' || status === 'processing' ? 'border-amber-400' : 'border-white/70';
    const text = status === 'success' ? (successText || STATUS_TEXT.success) : STATUS_TEXT[status];

    return (
        <div className="space-y-4">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl bg-gray-900">
                {/* Mirrored like a selfie camera; the face box is inside the same mirrored layer */}
                <div className="absolute inset-0 -scale-x-100">
                    <video ref={videoRef} playsInline autoPlay muted className="h-full w-full object-cover" />
                    {box && status !== 'success' && (
                        <div
                            className={`absolute rounded-lg border-2 ${ringColour} transition-all duration-150`}
                            style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }}
                        />
                    )}
                </div>
                {/* Oval guide */}
                <div className={`pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed ${ringColour}`} />
                {status === 'success' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-600/80 text-white">
                        <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                )}
            </div>

            <p className="text-center text-sm font-semibold text-gray-900" role="status" aria-live="polite">
                {error ? '' : text}
            </p>

            {error && (
                <div className="space-y-3 text-center">
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>
                    {streamRef.current && (
                        <button type="button" onClick={scan} className="inline-flex min-h-11 items-center rounded-full bg-[#0E1A3D] px-5 text-sm font-semibold text-white hover:bg-[#0A1430]">
                            Try again
                        </button>
                    )}
                </div>
            )}

            <p className="text-center text-xs text-gray-500">
                Face recognition runs on this device. Use good light and remove sunglasses or a mask.
            </p>
        </div>
    );
};

const FaceCameraModal = ({ open, onClose, title = 'Face ID', description, samples = 1, onCapture, onDone, successText }) => (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
        {open && <CameraBody samples={samples} onCapture={onCapture} onDone={onDone} successText={successText} />}
    </Modal>
);

export default FaceCameraModal;
