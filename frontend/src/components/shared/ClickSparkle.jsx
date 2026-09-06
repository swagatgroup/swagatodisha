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
                        animate={{ opacity: 0, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            left: click.x - 10,
                            top: click.y - 10,
                            width: 20,
                            height: 20,
                        }}
                    >
                        {/* Particles */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: 0, y: 0, scale: 1 }}
                                animate={{
                                    x: Math.cos((i * 60) * Math.PI / 180) * 20, // Halved from 40 to 20
                                    y: Math.sin((i * 60) * Math.PI / 180) * 20, // Halved from 40 to 20
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
                                    backgroundColor: i % 2 === 0 ? '#7B3FA0' : '#A855D0', // Swagat theme colors
                                    boxShadow: `0 0 6px ${i % 2 === 0 ? '#7B3FA0' : '#A855D0'}`
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
