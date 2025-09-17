import {useState, useRef, useEffect} from 'react';
import { motion } from 'framer-motion';

const PerformanceOptimizedImage = ({
    src,
    alt,
    width,
    height,
    className = '',
    placeholder = null,
    lazy = true,
    quality = 80,
    format = 'webp',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(!lazy);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    // Optimize image URL
    const getOptimizedSrc = (originalSrc) => {
        if (!originalSrc) return '';

        // If using Cloudinary
        if (originalSrc.includes('cloudinary.com')) {
            const transformations = [];

            if (width) transformations.push(`w_${width}`);
            if (height) transformations.push(`h_${height}`);
            if (quality) transformations.push(`q_${quality}`);
            if (format) transformations.push(`f_${format}`);

            const baseUrl = originalSrc.split('/upload/')[0];
            const publicId = originalSrc.split('/upload/')[1];

            return `${baseUrl}/upload/${transformations.join(',')}/${publicId}`;
        }

        return originalSrc;
    };

    const optimizedSrc = getOptimizedSrc(src);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!lazy || !imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );

        observer.observe(imgRef.current);
        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [lazy]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
    };

    // Skeleton loader component
    const SkeletonLoader = () => (
        <div
            className={`bg-gray-200 animate-pulse rounded ${className}`}
            style={{ width, height }}
            {...props}
        >
            {placeholder || (
                <div className="w-full h-full flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>
            )}
        </div>
    );

    // Error state component
    const ErrorState = () => (
        <div
            className={`bg-gray-100 border border-gray-300 rounded flex items-center justify-center ${className}`}
            style={{ width, height }}
            {...props}
        >
            <div className="text-center text-gray-500">
                <svg
                    className="w-8 h-8 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                </svg>
                <p className="text-sm">Failed to load image</p>
            </div>
        </div>
    );

    if (hasError) {
        return <ErrorState />;
    }

    if (!isInView) {
        return <SkeletonLoader />;
    }

    return (
        <div className="relative" ref={imgRef}>
            {!isLoaded && <SkeletonLoader />}

            <motion.img
                src={optimizedSrc}
                alt={alt}
                className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                style={{ width, height }}
                onLoad={handleLoad}
                onError={handleError}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                loading={lazy ? 'lazy' : 'eager'}
                {...props}
            />
        </div>
    );
};

export default PerformanceOptimizedImage;
