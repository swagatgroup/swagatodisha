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
                        initial={{ opacity: 1, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 1.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            left: click.x - 15,
                            top: click.y - 15,
                            width: 30,
                            height: 30,
                        }}
                    >
                        {/* Particles */}
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                                animate={{
                                    x: Math.cos((i * 45) * Math.PI / 180) * 35, // Increased radius to 35
                                    y: Math.sin((i * 45) * Math.PI / 180) * 35, // Increased radius to 35
                                    scale: 0.2,
                                    opacity: 0
                                }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    width: 10,  // Thicker droplets
                                    height: 10, // Thicker droplets
                                    marginLeft: -5,
                                    marginTop: -5,
                                    borderRadius: '50%',
                                    backgroundColor: i % 2 === 0 ? '#7B3FA0' : '#E8A317', // Purple and Gold theme colors
                                    boxShadow: `0 0 8px ${i % 2 === 0 ? '#7B3FA0' : '#E8A317'}`, // Glow effect
                                    opacity: 1 // Full opacity
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
