import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

const VirtualList = ({
    items = [],
    itemHeight = 60,
    containerHeight = 400,
    overscan = 5,
    renderItem,
    className = '',
    onScroll = null
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);
    const scrollElementRef = useRef(null);

    // Calculate visible range
    const visibleRange = useMemo(() => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
            items.length - 1
        );

        return {
            startIndex: Math.max(0, startIndex - overscan),
            endIndex
        };
    }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

    // Get visible items
    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    }, [items, visibleRange]);

    // Calculate total height
    const totalHeight = items.length * itemHeight;

    // Calculate offset for visible items
    const offsetY = visibleRange.startIndex * itemHeight;

    // Handle scroll
    const handleScroll = (e) => {
        const newScrollTop = e.target.scrollTop;
        setScrollTop(newScrollTop);

        if (onScroll) {
            onScroll(newScrollTop);
        }
    };

    // Scroll to specific item
    const scrollToItem = (index) => {
        if (containerRef.current) {
            const targetScrollTop = index * itemHeight;
            containerRef.current.scrollTop = targetScrollTop;
        }
    };

    // Scroll to top
    const scrollToTop = () => {
        scrollToItem(0);
    };

    // Scroll to bottom
    const scrollToBottom = () => {
        scrollToItem(items.length - 1);
    };

    // Get scroll position info
    const getScrollInfo = () => {
        return {
            scrollTop,
            scrollPercentage: (scrollTop / (totalHeight - containerHeight)) * 100,
            visibleStart: visibleRange.startIndex,
            visibleEnd: visibleRange.endIndex,
            totalItems: items.length
        };
    };

    return (
        <div className={`relative ${className}`}>
            {/* Scroll container */}
            <div
                ref={containerRef}
                className="overflow-auto"
                style={{ height: containerHeight }}
                onScroll={handleScroll}
            >
                {/* Total height spacer */}
                <div style={{ height: totalHeight, position: 'relative' }}>
                    {/* Visible items container */}
                    <div
                        ref={scrollElementRef}
                        style={{
                            position: 'absolute',
                            top: offsetY,
                            left: 0,
                            right: 0
                        }}
                    >
                        {visibleItems.map((item, index) => {
                            const actualIndex = visibleRange.startIndex + index;

                            return (
                                <motion.div
                                    key={actualIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                    style={{ height: itemHeight }}
                                >
                                    {renderItem(item, actualIndex)}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Scroll indicators (optional) */}
            {scrollTop > 100 && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    className="absolute top-4 right-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                    title="Scroll to top"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </motion.button>
            )}

            {scrollTop < totalHeight - containerHeight - 100 && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                    title="Scroll to bottom"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </motion.button>
            )}
        </div>
    );
};

// Hook for virtual list
export const useVirtualList = (items, options = {}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(400);

    const {
        itemHeight = 60,
        overscan = 5
    } = options;

    const visibleRange = useMemo(() => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
            items.length - 1
        );

        return {
            startIndex: Math.max(0, startIndex - overscan),
            endIndex
        };
    }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    }, [items, visibleRange]);

    const totalHeight = items.length * itemHeight;
    const offsetY = visibleRange.startIndex * itemHeight;

    return {
        visibleItems,
        totalHeight,
        offsetY,
        visibleRange,
        scrollTop,
        setScrollTop,
        containerHeight,
        setContainerHeight
    };
};

export default VirtualList;
