import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'

const PremiumHero = () => {
  const heroRef = useRef(null)
  const textRef = useRef(null)
  const statsRef = useRef(null)
  const splineRef = useRef(null)
  const [isInteracting, setIsInteracting] = useState(false)

  useEffect(() => {
    const tl = gsap.timeline()

    // Animate hero text
    tl.fromTo(textRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )

    // Animate stats
    tl.fromTo(statsRef.current.children,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" },
      "-=0.5"
    )

    // Animate CTA button
    tl.fromTo('.hero-cta',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" },
      "-=0.3"
    )
  }, [])

  useEffect(() => {
    // Load Spline script dynamically
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js'
    script.onload = () => {
      console.log('Spline script loaded successfully!')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (splineRef.current) {
        // Send mouse position to Spline for robot tracking
        const rect = heroRef.current?.getBoundingClientRect()
        if (rect) {
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          // Calculate normalized coordinates for Spline
          const normalizedX = (x / rect.width) * 2 - 1
          const normalizedY = -(y / rect.height) * 2 + 1

          // Send custom event to Spline
          const customEvent = new CustomEvent('mousemove', {
            detail: { x: normalizedX, y: normalizedY }
          })
          splineRef.current.dispatchEvent(customEvent)
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section
      ref={heroRef}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden pt-20"
    >
      {/* Clean Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-transparent via-transparent to-transparent"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Hero Content */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">

          {/* Left Side - Hero Text */}
          <div className="space-y-8" ref={textRef}>
            {/* Main Heading */}
            <div className="space-y-4">
              <motion.h1
                className="text-5xl lg:text-7xl font-bold text-white leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome to{' '}
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Swagat
                </span>
              </motion.h1>

              <motion.h2
                className="text-2xl lg:text-3xl font-semibold text-blue-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Group of Institutions
              </motion.h2>
            </div>

            {/* Description */}
            <motion.p
              className="text-xl text-gray-300 leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Empowering minds, shaping futures. Join thousands of students who have transformed their lives through excellence in education, innovation, and revolutionary learning approaches.
            </motion.p>

            {/* Stats */}
            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-6 pt-6"
            >
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-yellow-400">5000+</div>
                <div className="text-sm text-gray-400">Students</div>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-blue-400">50+</div>
                <div className="text-sm text-gray-400">Faculty</div>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-green-400">95%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <motion.button
                className="hero-cta px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl text-lg shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Programs
              </motion.button>

              <motion.button
                className="hero-cta px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl text-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us
              </motion.button>
            </div>
          </div>

          {/* Right Side - Compact Transparent 3D Robot */}
          <div className="relative h-[600px] flex items-center justify-center">
            {/* Compact Spline 3D Robot - No Background */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              <spline-viewer
                ref={splineRef}
                url="https://prod.spline.design/FVZWbQH2B6ndj9UU/scene.splinecode"
                events-target="global"
                className="w-full h-full"
                style={{
                  width: '320px',
                  height: '320px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none'
                }}
                loading-anim-type="none"
                show-loading="false"
                background="transparent"
              />

              {/* Loading State - Smaller and Transparent */}
              <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                <div className="text-center text-white">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm font-semibold">Loading Robot...</p>
                </div>
              </div>
            </div>

            {/* Interactive Instructions */}
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 text-white text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">Move your mouse to control the robot</span>
              </div>
            </motion.div>

            {/* Floating Interactive Elements */}
            <motion.div
              className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-2xl cursor-pointer"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.2, rotate: 720 }}
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>

            <motion.div
              className="absolute -bottom-8 -left-8 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xl shadow-2xl cursor-pointer"
              animate={{
                y: [0, 15, 0],
                rotate: [0, -360],
                scale: [1, 0.9, 1]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              whileHover={{ scale: 1.3, rotate: -720 }}
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </motion.div>

            {/* Energy Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full"
                style={{
                  left: `${50 + Math.cos(i * 30 * Math.PI / 180) * 80}%`,
                  top: `${50 + Math.sin(i * 30 * Math.PI / 180) * 80}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-[-0.25rem] rotate-180 left-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="#ffffff"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.71,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="#ffffff"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="#ffffff"
          ></path>
        </svg>
      </div>
    </section>
  )
}

export default PremiumHero
