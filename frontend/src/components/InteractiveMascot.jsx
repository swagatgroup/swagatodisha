import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Float, Environment, PresentationControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// 3D Character Component
function ProfessorSwagat({ mousePosition, isHovered, scrollProgress }) {
    const meshRef = useRef()
    const groupRef = useRef()
    const [animationState, setAnimationState] = useState('idle')
    const [emotion, setEmotion] = useState('happy')

    // Mouse interaction
    useFrame((state) => {
        if (meshRef.current && mousePosition) {
            // Smooth head tracking
            const targetRotationY = (mousePosition.x - 0.5) * 0.5
            const targetRotationX = (mousePosition.y - 0.5) * 0.3

            meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.05
            meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * 0.05

            // Floating animation
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.5

            // Scroll-based movement
            if (scrollProgress > 0) {
                meshRef.current.position.z = scrollProgress * 2
            }
        }
    })

    // Animation states
    useEffect(() => {
        const animationInterval = setInterval(() => {
            const states = ['idle', 'thinking', 'excited', 'teaching']
            const randomState = states[Math.floor(Math.random() * states.length)]
            setAnimationState(randomState)

            // Change emotion based on state
            if (randomState === 'excited') setEmotion('excited')
            else if (randomState === 'thinking') setEmotion('curious')
            else setEmotion('happy')
        }, 5000)

        return () => clearInterval(animationInterval)
    }, [])

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Main Character Body */}
            <mesh ref={meshRef} position={[0, 0.5, 0]}>
                {/* Head */}
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color={emotion === 'excited' ? '#ffd700' : '#ffdbac'} />

                {/* Eyes */}
                <group position={[0, 0.1, 0.25]}>
                    <mesh position={[-0.08, 0, 0]}>
                        <sphereGeometry args={[0.05, 16, 16]} />
                        <meshStandardMaterial color="#000" />
                    </mesh>
                    <mesh position={[0.08, 0, 0]}>
                        <sphereGeometry args={[0.05, 16, 16]} />
                        <meshStandardMaterial color="#000" />
                    </mesh>
                </group>

                {/* Smile */}
                <mesh position={[0, -0.1, 0.25]}>
                    <torusGeometry args={[0.08, 0.02, 16, 32, Math.PI]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
            </mesh>

            {/* Body */}
            <mesh position={[0, -0.3, 0]}>
                <cylinderGeometry args={[0.25, 0.3, 0.6, 32]} />
                <meshStandardMaterial color="#4a90e2" />
            </mesh>

            {/* Arms */}
            <group position={[0, -0.2, 0]}>
                <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.sin(Date.now() * 0.003) * 0.3]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} />
                    <meshStandardMaterial color="#ffdbac" />
                </mesh>
                <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.sin(Date.now() * 0.003) * 0.3]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} />
                    <meshStandardMaterial color="#ffdbac" />
                </mesh>
            </group>

            {/* Legs */}
            <group position={[0, -0.8, 0]}>
                <mesh position={[-0.15, 0, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
                    <meshStandardMaterial color="#2c3e50" />
                </mesh>
                <mesh position={[0.15, 0, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
                    <meshStandardMaterial color="#2c3e50" />
                </mesh>
            </group>

            {/* Graduation Cap */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh position={[0, 0.8, 0]}>
                    <boxGeometry args={[0.4, 0.1, 0.4]} />
                    <meshStandardMaterial color="#2c3e50" />
                </mesh>
                <mesh position={[0, 0.9, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.3, 16]} />
                    <meshStandardMaterial color="#e74c3c" />
                </mesh>
            </Float>

            {/* Energy Particles */}
            {emotion === 'excited' && (
                <group>
                    {[...Array(20)].map((_, i) => (
                        <mesh
                            key={i}
                            position={[
                                (Math.random() - 0.5) * 2,
                                Math.random() * 2,
                                (Math.random() - 0.5) * 2
                            ]}
                        >
                            <sphereGeometry args={[0.02, 8, 8]} />
                            <meshStandardMaterial color="#ffd700" emissive="#ffd700" />
                        </mesh>
                    ))}
                </group>
            )}
        </group>
    )
}

// Main Mascot Container
const InteractiveMascot = ({ isVisible = true }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
    const [scrollProgress, setScrollProgress] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [animationState, setAnimationState] = useState('idle')

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight
            })
        }

        const handleScroll = () => {
            const scrolled = window.scrollY
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight
            setScrollProgress(scrolled / maxScroll)
        }

        // Animation states
        const animationInterval = setInterval(() => {
            const states = ['idle', 'thinking', 'excited', 'teaching']
            const randomState = states[Math.floor(Math.random() * states.length)]
            setAnimationState(randomState)
        }, 5000)

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('scroll', handleScroll)
            clearInterval(animationInterval)
        }
    }, [])

    if (!isVisible) return null

    return (
        <motion.div
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                style={{ background: 'transparent' }}
                className="w-full h-full"
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Environment preset="sunset" />

                <PresentationControls
                    global
                    rotation={[0, -Math.PI / 4, 0]}
                    polar={[-Math.PI / 4, Math.PI / 4]}
                    azimuth={[-Math.PI / 4, Math.PI / 4]}
                >
                    <ProfessorSwagat
                        mousePosition={mousePosition}
                        isHovered={isHovered}
                        scrollProgress={scrollProgress}
                    />
                </PresentationControls>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={false}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 2}
                />
            </Canvas>

            {/* Speech Bubble - HTML Overlay instead of 3D Text */}
            {animationState === 'teaching' && (
                <motion.div
                    className="absolute top-1/4 right-1/4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/50"
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="text-gray-800 font-semibold text-lg">Welcome!</div>
                    <div className="w-0 h-0 border-l-8 border-l-white/90 border-t-8 border-t-transparent absolute -left-2 top-4"></div>
                </motion.div>
            )}

            {/* Interactive Hints */}
            <motion.div
                className="z-1000 absolute bottom-8 left-8 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
            >
                ✨ Move your mouse to interact with Professor Swagat!
            </motion.div>
        </motion.div>
    )
}

export default InteractiveMascot
