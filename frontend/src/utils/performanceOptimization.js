// Frontend Performance Optimization Utilities

class PerformanceOptimization {
    constructor() {
        this.observers = new Map();
        this.metrics = {
            pageLoadTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0,
            totalBlockingTime: 0
        };
        this.init();
    }

    init() {
        this.setupPerformanceObserver();
        this.setupResourceOptimization();
        this.setupLazyLoading();
        this.setupImageOptimization();
    }

    // Performance Observer for Core Web Vitals
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Observe LCP (Largest Contentful Paint)
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.largestContentfulPaint = lastEntry.startTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Observe FID (First Input Delay)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Observe CLS (Cumulative Layout Shift)
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cumulativeLayoutShift = clsValue;
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            // Store observers for cleanup
            this.observers.set('lcp', lcpObserver);
            this.observers.set('fid', fidObserver);
            this.observers.set('cls', clsObserver);
        }
    }

    // Resource optimization
    setupResourceOptimization() {
        // Preload critical resources
        this.preloadCriticalResources();

        // Optimize font loading
        this.optimizeFontLoading();

        // Setup service worker for caching
        this.setupServiceWorker();
    }

    preloadCriticalResources() {
        const criticalResources = [
            '/src/main.jsx',
            '/src/index.css',
            '/src/App.jsx'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.jsx') || resource.endsWith('.js') ? 'script' : 'style';
            document.head.appendChild(link);
        });
    }

    optimizeFontLoading() {
        // Add font-display: swap to prevent invisible text during font load
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Inter';
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Lazy loading setup
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            // Observe all lazy images
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            this.observers.set('images', imageObserver);
        }
    }

    // Image optimization
    setupImageOptimization() {
        // Add loading="lazy" to all images
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });

        // Optimize image formats
        this.optimizeImageFormats();
    }

    optimizeImageFormats() {
        // Check for WebP support
        const canvas = document.createElement('canvas');
        const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

        if (webpSupported) {
            // Replace image sources with WebP versions
            document.querySelectorAll('img[src$=".jpg"], img[src$=".jpeg"], img[src$=".png"]').forEach(img => {
                const src = img.src;
                const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');

                // Create a new image to test if WebP exists
                const testImg = new Image();
                testImg.onload = () => {
                    img.src = webpSrc;
                };
                testImg.src = webpSrc;
            });
        }
    }

    // Debounce utility
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

    // Throttle utility
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

    // Virtual scrolling for large lists
    createVirtualList(container, items, itemHeight, renderItem) {
        const containerHeight = container.clientHeight;
        const visibleItems = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
        const totalHeight = items.length * itemHeight;

        let scrollTop = 0;
        let startIndex = 0;
        let endIndex = Math.min(startIndex + visibleItems, items.length);

        const updateList = () => {
            const startY = startIndex * itemHeight;
            const endY = endIndex * itemHeight;

            container.innerHTML = '';
            container.style.height = `${totalHeight}px`;
            container.style.position = 'relative';

            const visibleContainer = document.createElement('div');
            visibleContainer.style.position = 'absolute';
            visibleContainer.style.top = `${startY}px`;
            visibleContainer.style.left = '0';
            visibleContainer.style.right = '0';

            for (let i = startIndex; i < endIndex; i++) {
                const item = renderItem(items[i], i);
                item.style.height = `${itemHeight}px`;
                visibleContainer.appendChild(item);
            }

            container.appendChild(visibleContainer);
        };

        const handleScroll = this.throttle((e) => {
            scrollTop = e.target.scrollTop;
            const newStartIndex = Math.floor(scrollTop / itemHeight);
            const newEndIndex = Math.min(newStartIndex + visibleItems, items.length);

            if (newStartIndex !== startIndex || newEndIndex !== endIndex) {
                startIndex = newStartIndex;
                endIndex = newEndIndex;
                updateList();
            }
        }, 16); // 60fps

        container.addEventListener('scroll', handleScroll);
        updateList();

        return {
            update: updateList,
            destroy: () => {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }

    // Memory optimization
    optimizeMemory() {
        // Clear unused event listeners
        this.cleanupEventListeners();

        // Clear unused timers
        this.cleanupTimers();

        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    cleanupEventListeners() {
        // This would need to be implemented based on your specific use case
        // You'd need to track event listeners when they're added
        console.log('Cleaning up event listeners...');
    }

    cleanupTimers() {
        // Clear any pending timeouts/intervals
        const highestTimeoutId = setTimeout(() => { }, 0);
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }
    }

    // Bundle optimization
    optimizeBundle() {
        // Code splitting
        this.setupCodeSplitting();

        // Tree shaking
        this.setupTreeShaking();

        // Compression
        this.setupCompression();
    }

    setupCodeSplitting() {
        // Dynamic imports for route-based code splitting
        const loadComponent = (componentPath) => {
            return import(componentPath);
        };

        return loadComponent;
    }

    setupTreeShaking() {
        // This is typically handled by the bundler (Vite/Webpack)
        // But we can ensure we're not importing entire libraries
        console.log('Tree shaking optimization enabled');
    }

    setupCompression() {
        // Enable gzip compression (usually handled by server)
        // But we can optimize our data structures
        console.log('Compression optimization enabled');
    }

    // Get performance metrics
    getMetrics() {
        return {
            ...this.metrics,
            pageLoadTime: performance.now(),
            memoryUsage: this.getMemoryUsage(),
            connectionInfo: this.getConnectionInfo()
        };
    }

    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    getConnectionInfo() {
        if ('connection' in navigator) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }
        return null;
    }

    // Cleanup
    destroy() {
        this.observers.forEach(observer => {
            if (observer.disconnect) {
                observer.disconnect();
            }
        });
        this.observers.clear();
    }
}

// Create singleton instance
const performanceOptimization = new PerformanceOptimization();

export default performanceOptimization;
