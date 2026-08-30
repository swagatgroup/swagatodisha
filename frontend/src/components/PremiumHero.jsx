import {useEffect, useRef, useState} from 'react';
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
      // Spline script loaded successfully
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
      className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1212] relative overflow-hidden pt-28 pb-20 pattern-bg dark:pattern-bg-dark"
    >
      {/* Main Hero Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">

          {/* Left Side - Hero Text */}
          <div className="space-y-8" ref={textRef}>
            {/* Main Heading */}
            <div className="space-y-4">
              <motion.h1
                className="text-5xl lg:text-7xl font-bold font-baloo text-[#1A1A1A] dark:text-[#FAF7F2] leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome to{' '}
                <span className="text-[#7B3FA0] dark:text-[#A855D0]">
                  Swagat
                </span>
              </motion.h1>

              <motion.h2
                className="text-2xl lg:text-3xl font-bold font-baloo text-[#387B95]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Group of Institutions
              </motion.h2>
            </div>

            {/* Description */}
            <motion.p
              className="text-xl text-[#666666] dark:text-[#B8A8C8] leading-relaxed max-w-lg font-lato"
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
                className="text-center bg-white dark:bg-[#2A1E2E] py-4 rounded-2xl shadow-card border border-[#7B3FA0]/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold font-baloo text-[#F5A623]">5000+</div>
                <div className="text-sm font-bold text-[#1D4B5E] dark:text-[#D0E8F0] uppercase tracking-wide">Students</div>
              </motion.div>

              <motion.div
                className="text-center bg-white dark:bg-[#2A1E2E] py-4 rounded-2xl shadow-card border border-[#7B3FA0]/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold font-baloo text-[#387B95]">50+</div>
                <div className="text-sm font-bold text-[#1D4B5E] dark:text-[#D0E8F0] uppercase tracking-wide">Faculty</div>
              </motion.div>

              <motion.div
                className="text-center bg-white dark:bg-[#2A1E2E] py-4 rounded-2xl shadow-card border border-[#7B3FA0]/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold font-baloo text-[#7B3FA0] dark:text-[#A855D0]">95%</div>
                <div className="text-sm font-bold text-[#1D4B5E] dark:text-[#D0E8F0] uppercase tracking-wide">Success</div>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <motion.button
                className="hero-cta px-8 py-4 bg-[#387B95] text-white font-bold rounded-pill text-lg shadow-teal hover:bg-[#2b6175] transition-all duration-300 hover:scale-105"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Programs
              </motion.button>

              <motion.button
                className="hero-cta px-8 py-4 border-2 border-[#7B3FA0] dark:border-[#A855D0] text-[#7B3FA0] dark:text-[#A855D0] font-bold rounded-pill text-lg hover:bg-[#7B3FA0] dark:hover:bg-[#A855D0] hover:text-white transition-all duration-300 hover:scale-105 bg-white/50 dark:bg-transparent backdrop-blur-sm"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us
              </motion.button>
            </div>
          </div>

          {/* Right Side - Compact Transparent 3D Robot */}
          <div className="relative h-[600px] flex items-center justify-center">
            {/* Organic Shape Behind Robot */}
            <div className="absolute inset-0 bg-[#EDE0F7] dark:bg-[#3D2A4A]/30 rounded-full blur-[80px] opacity-60"></div>
            
            {/* Compact Spline 3D Robot - No Background */}
            <div className="relative w-80 h-80 flex items-center justify-center z-10">
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

              {/* Loading State */}
              <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none">
                <div className="text-center text-[#7B3FA0] dark:text-[#A855D0]">
                  <div className="w-12 h-12 border-4 border-[#7B3FA0]/30 border-t-[#7B3FA0] rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm font-bold">Loading Model...</p>
                </div>
              </div>
            </div>

            {/* Interactive Instructions */}
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#2A1E2E] shadow-card rounded-pill px-6 py-3 text-[#1A1A1A] dark:text-[#FAF7F2] text-center border border-[#7B3FA0]/10 z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[#387B95] font-bold text-sm">Move your mouse to interact</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Wave - Clean White/Dark Base */}
      <div className="absolute bottom-[-0.25rem] left-0 w-full z-20">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[60px] md:h-[120px]">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z"
            className="fill-white dark:fill-[#2A1E2E]"
          ></path>
        </svg>
      </div>
    </section>
  )
}

export default PremiumHero
