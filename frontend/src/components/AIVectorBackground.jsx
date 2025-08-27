import React from 'react'
import { motion } from 'framer-motion'

const AIVectorBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Neural Network Pattern */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 1200 800">
                    {/* Neural Network Nodes */}
                    {[...Array(15)].map((_, i) => (
                        <motion.circle
                            key={`node-${i}`}
                            cx={100 + (i * 80) % 1200}
                            cy={100 + Math.floor(i / 15) * 200}
                            r="4"
                            fill="url(#neuralGradient)"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 3 + i * 0.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.1
                            }}
                        />
                    ))}

                    {/* Neural Network Connections */}
                    {[...Array(20)].map((_, i) => (
                        <motion.line
                            key={`connection-${i}`}
                            x1={100 + (i * 60) % 1200}
                            y1={100 + Math.floor(i / 20) * 200}
                            x2={150 + (i * 60) % 1200}
                            y2={150 + Math.floor(i / 20) * 200}
                            stroke="url(#lineGradient)"
                            strokeWidth="1"
                            opacity="0.3"
                            animate={{
                                opacity: [0.1, 0.5, 0.1],
                                strokeDasharray: ["0,100", "100,0", "0,100"]
                            }}
                            transition={{
                                duration: 4 + i * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2
                            }}
                        />
                    ))}

                    <defs>
                        <radialGradient id="neuralGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </radialGradient>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Clean Background Overlay */}
            <div className="absolute inset-0 opacity-3">
                <div className="w-full h-full bg-gradient-to-br from-transparent via-transparent to-transparent"></div>
            </div>

            {/* Floating Data Points */}
            <div className="absolute inset-0">
                {[...Array(25)].map((_, i) => (
                    <motion.div
                        key={`data-${i}`}
                        className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.random() * 60 - 30, 0],
                            scale: [0, 1, 0],
                            opacity: [0, 0.8, 0]
                        }}
                        transition={{
                            duration: 8 + Math.random() * 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 8
                        }}
                    />
                ))}
            </div>

            {/* Abstract Circuit Pattern */}
            <div className="absolute inset-0 opacity-8">
                <svg className="w-full h-full" viewBox="0 0 1200 800">
                    {/* Circuit Paths */}
                    <motion.path
                        d="M 100 200 Q 300 150 500 200 T 900 200 L 1000 200"
                        fill="none"
                        stroke="url(#circuitGradient)"
                        strokeWidth="2"
                        strokeDasharray="10,5"
                        animate={{
                            strokeDashoffset: [0, -15]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />

                    <motion.path
                        d="M 200 400 Q 400 350 600 400 T 1000 400 L 1100 400"
                        fill="none"
                        stroke="url(#circuitGradient)"
                        strokeWidth="2"
                        strokeDasharray="10,5"
                        animate={{
                            strokeDashoffset: [0, -15]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 5
                        }}
                    />

                    <motion.path
                        d="M 150 600 Q 350 550 550 600 T 950 600 L 1050 600"
                        fill="none"
                        stroke="url(#circuitGradient)"
                        strokeWidth="2"
                        strokeDasharray="10,5"
                        animate={{
                            strokeDashoffset: [0, -15]
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 10
                        }}
                    />

                    <defs>
                        <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Quantum Field Effect */}
            <div className="absolute inset-0 opacity-6">
                <svg className="w-full h-full" viewBox="0 0 1200 800">
                    {[...Array(8)].map((_, i) => (
                        <motion.circle
                            key={`quantum-${i}`}
                            cx={150 + (i * 120) % 1200}
                            cy={150 + Math.floor(i / 8) * 500}
                            r="60"
                            fill="none"
                            stroke="url(#quantumGradient)"
                            strokeWidth="1"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.1, 0.3, 0.1],
                                strokeDasharray: ["0,400", "400,0", "0,400"]
                            }}
                            transition={{
                                duration: 15 + i * 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 1.5
                            }}
                        />
                    ))}

                    <defs>
                        <radialGradient id="quantumGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>

            {/* DNA Helix Pattern */}
            <div className="absolute inset-0 opacity-4">
                <svg className="w-full h-full" viewBox="0 0 1200 800">
                    {[...Array(20)].map((_, i) => (
                        <motion.g key={`dna-${i}`}>
                            <motion.circle
                                cx={400 + Math.sin(i * 0.3) * 100}
                                cy={50 + i * 35}
                                r="3"
                                fill="url(#dnaGradient1)"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.3, 0.8, 0.3]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: i * 0.2
                                }}
                            />
                            <motion.circle
                                cx={800 + Math.sin(i * 0.3 + Math.PI) * 100}
                                cy={50 + i * 35}
                                r="3"
                                fill="url(#dnaGradient2)"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.3, 0.8, 0.3]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: i * 0.2 + 2
                                }}
                            />
                        </motion.g>
                    ))}

                    <defs>
                        <radialGradient id="dnaGradient1" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </radialGradient>
                        <radialGradient id="dnaGradient2" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>

            {/* Floating Equations */}
            <div className="absolute inset-0 opacity-3">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`equation-${i}`}
                        className="absolute text-xs font-mono text-purple-400/30"
                        style={{
                            left: `${20 + (i * 15)}%`,
                            top: `${20 + (i * 8)}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.1, 0.4, 0.1]
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 1.5
                        }}
                    >
                        {['E=mc²', 'πr²', '∫f(x)dx', '∇²ψ', '∑∞', 'lim x→∞'][i]}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default AIVectorBackground
