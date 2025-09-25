// Frontend Performance Optimization Utilities

class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            renderTime: 0,
            apiCalls: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

        this.observers = new Map();
        this.lazyLoadQueue = [];
        this.isIntersectionObserverSupported = 'IntersectionObserver' in window;
    }

    // Measure page load performance
    measurePageLoad() {
        if (typeof window !== 'undefined' && window.performance) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
            }
        }
    }

    // Measure component render time
    measureRenderTime(componentName, startTime) {
        const renderTime = performance.now() - startTime;
        this.metrics.renderTime += renderTime;

        // Component render time logged in development
    }

    // Lazy loading utility
    createLazyObserver(callback, options = {}) {
        if (!this.isIntersectionObserverSupported) {
            // Fallback for browsers without IntersectionObserver
            callback();
            return null;
        }

        const defaultOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1,
            ...options
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, defaultOptions);

        return observer;
    }

    // Lazy load images
    lazyLoadImages(selector = 'img[data-src]') {
        const images = document.querySelectorAll(selector);

        if (images.length === 0) return;

        const imageObserver = this.createLazyObserver((img) => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
            }
        });

        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }

    // Lazy load components
    lazyLoadComponent(component, loadingComponent = null) {
        return React.lazy(() => {
            const startTime = performance.now();

            return component().then(module => {
                this.measureRenderTime('LazyComponent', startTime);
                return module;
            });
        });
    }

    // Debounce function
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Memoization utility
    memoize(fn, keyGenerator = (...args) => JSON.stringify(args)) {
        const cache = new Map();

        return (...args) => {
            const key = keyGenerator(...args);

            if (cache.has(key)) {
                this.metrics.cacheHits++;
                return cache.get(key);
            }

            this.metrics.cacheMisses++;
            const result = fn(...args);
            cache.set(key, result);
            return result;
        };
    }

    // Virtual scrolling for large lists
    createVirtualScroller({
        containerHeight,
        itemHeight,
        itemCount,
        renderItem,
        overscan = 5
    }) {
        return {
            getVisibleRange(scrollTop) {
                const startIndex = Math.floor(scrollTop / itemHeight);
                const endIndex = Math.min(
                    startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
                    itemCount - 1
                );

                return {
                    startIndex: Math.max(0, startIndex - overscan),
                    endIndex
                };
            },

            getTotalHeight() {
                return itemCount * itemHeight;
            },

            getOffsetY(index) {
                return index * itemHeight;
            }
        };
    }

    // Image optimization
    optimizeImage(src, options = {}) {
        const {
            width,
            height,
            quality = 80,
            format = 'webp'
        } = options;

        // If using a service like Cloudinary
        if (src.includes('cloudinary.com')) {
            const transformations = [];

            if (width) transformations.push(`w_${width}`);
            if (height) transformations.push(`h_${height}`);
            if (quality) transformations.push(`q_${quality}`);
            if (format) transformations.push(`f_${format}`);

            const baseUrl = src.split('/upload/')[0];
            const publicId = src.split('/upload/')[1];

            return `${baseUrl}/upload/${transformations.join(',')}/${publicId}`;
        }

        return src;
    }

    // Bundle size optimization
    analyzeBundleSize() {
        if (typeof window !== 'undefined' && window.performance) {
            const resources = performance.getEntriesByType('resource');
            const jsResources = resources.filter(r => r.name.includes('.js'));
            const cssResources = resources.filter(r => r.name.includes('.css'));

            const totalJSSize = jsResources.reduce((total, r) => total + r.transferSize, 0);
            const totalCSSSize = cssResources.reduce((total, r) => total + r.transferSize, 0);

            return {
                js: {
                    count: jsResources.length,
                    totalSize: totalJSSize,
                    averageSize: totalJSSize / jsResources.length
                },
                css: {
                    count: cssResources.length,
                    totalSize: totalCSSSize,
                    averageSize: totalCSSSize / cssResources.length
                },
                total: totalJSSize + totalCSSSize
            };
        }

        return null;
    }

    // API call optimization
    optimizeApiCall(url, options = {}) {
        const {
            cache = true,
            timeout = 10000,
            retries = 3
        } = options;

        this.metrics.apiCalls++;

        return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(timeout)
        }).catch(error => {
            if (retries > 0) {
                return this.optimizeApiCall(url, { ...options, retries: retries - 1 });
            }
            throw error;
        });
    }

    // Preload critical resources
    preloadResource(href, as = 'script', crossorigin = false) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (crossorigin) link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    // Prefetch resources
    prefetchResource(href, as = 'script') {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.as = as;
        document.head.appendChild(link);
    }

    // Service Worker registration
    registerServiceWorker() {
        // Only register service worker in production
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            window.addEventListener('load', () => {
                if ('serviceWorker' in navigator) {
                    try {
                        navigator.serviceWorker.register('/sw.js');
                    } catch (err) {
                        console.warn('Service worker registration failed:', err);
                    }
                }
                    .then(registration => {
                    // Service Worker registered
                })
                    .catch(registrationError => {
                        // Service Worker registration failed
                    });
            });
        } else if (process.env.NODE_ENV === 'development') {
            console.log('Service Worker disabled in development mode');
        }
    }

    // Performance monitoring
    async startPerformanceMonitoring() {
        // Monitor Core Web Vitals
        try {
            const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
            // Web Vitals metrics collected
            getCLS(() => { });
            getFID(() => { });
            getFCP(() => { });
            getLCP(() => { });
            getTTFB(() => { });
        } catch (error) {
            console.warn('Web Vitals not available:', error);
        }

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('Long task detected:', entry);
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
        }
    }

    // Get performance metrics
    getMetrics() {
        return {
            ...this.metrics,
            cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100,
            bundleSize: this.analyzeBundleSize()
        };
    }

    // Cleanup
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.lazyLoadQueue = [];
    }
}

// Create singleton instance
const performanceOptimizer = new PerformanceOptimizer();

export default performanceOptimizer;
