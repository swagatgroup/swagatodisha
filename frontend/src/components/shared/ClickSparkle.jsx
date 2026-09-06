import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ClickSparkle = () => {
    const [clicks, setClicks] = useState([]);

    useEffect(() => {
        const handleClick = (e) => {
            const newClick = {
                id: Date.now() + Math.random(),
                x: e.clientX,
                y: e.clientY
            };
            setClicks((prev) => [...prev, newClick]);

            // Remove the spark after animation
            setTimeout(() => {
                setClicks((prev) => prev.filter(c => c.id !== newClick.id));
            }, 600);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            <AnimatePresence>
                {clicks.map((click) => (
                    <motion.div
                        key={click.id}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{ opacity: 0, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            left: click.x - 20,
                            top: click.y - 20,
                            width: 40,
                            height: 40,
                        }}
                    >
                        {/* Particles */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: 0, y: 0, scale: 1 }}
                                animate={{
                                    x: Math.cos((i * 60) * Math.PI / 180) * 40,
                                    y: Math.sin((i * 60) * Math.PI / 180) * 40,
                                    scale: 0
                                }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    width: 6,
                                    height: 6,
                                    marginLeft: -3,
                                    marginTop: -3,
                                    borderRadius: '50%',
                                    backgroundColor: '#8B4513', // Brown color as requested
                                    boxShadow: '0 0 4px #8B4513'
                                }}
                            />
                        ))}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ClickSparkle;
