// Utility functions for the application

// Smooth scroll to a specific section
export const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
    }
}

// Scroll to contact section
export const scrollToContact = () => {
    scrollToSection('contact')
}

// Intersection Observer utility for scroll animations
export const createScrollObserver = (callback, options = {}) => {
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options
    }

    return new IntersectionObserver(callback, defaultOptions)
}

// Parallax effect utility
export const createParallaxEffect = (element, speed = 0.5) => {
    if (!element) return

    const handleScroll = () => {
        const scrolled = window.pageYOffset
        const rate = scrolled * speed
        element.style.transform = `translateY(${rate}px)`
    }

    window.addEventListener('scroll', handleScroll)
    
    // Cleanup function
    return () => window.removeEventListener('scroll', handleScroll)
}

// Stagger animation utility
export const createStaggerAnimation = (elements, animationClass, staggerDelay = 100) => {
    if (!elements || elements.length === 0) return

    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add(animationClass)
        }, index * staggerDelay)
    })
}

// Typing effect utility
export const createTypingEffect = (element, text, speed = 100) => {
    if (!element) return

    let index = 0
    element.textContent = ''

    const type = () => {
        if (index < text.length) {
            element.textContent += text.charAt(index)
            index++
            setTimeout(type, speed)
        }
    }

    type()
}

// Counter animation utility
export const createCounterAnimation = (element, target, duration = 2000) => {
    if (!element) return

    let start = 0
    const increment = target / (duration / 16) // 60fps

    const updateCounter = () => {
        start += increment
        if (start < target) {
            element.textContent = Math.floor(start)
            requestAnimationFrame(updateCounter)
        } else {
            element.textContent = target
        }
    }

    updateCounter()
}

// Mouse parallax effect
export const createMouseParallax = (element, intensity = 0.1) => {
    if (!element) return

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e
        const { innerWidth, innerHeight } = window
        
        const x = (clientX - innerWidth / 2) * intensity
        const y = (clientY - innerHeight / 2) * intensity
        
        element.style.transform = `translate(${x}px, ${y}px)`
    }

    element.addEventListener('mousemove', handleMouseMove)
    
    return () => element.removeEventListener('mousemove', handleMouseMove)
}

// Smooth reveal animation
export const createRevealAnimation = (elements, options = {}) => {
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        animationClass: 'animate-fade-in-up',
        ...options
    }

    const observer = createScrollObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(defaultOptions.animationClass)
                observer.unobserve(entry.target)
            }
        })
    }, defaultOptions)

    if (Array.isArray(elements)) {
        elements.forEach(el => observer.observe(el))
    } else {
        observer.observe(elements)
    }

    return observer
}

// Floating animation utility
export const createFloatingAnimation = (element, options = {}) => {
    const defaultOptions = {
        duration: 3000,
        delay: 0,
        ease: 'easeInOut',
        ...options
    }

    if (!element) return

    const keyframes = [
        { transform: 'translateY(0px) rotate(0deg)' },
        { transform: 'translateY(-20px) rotate(2deg)' },
        { transform: 'translateY(-10px) rotate(-1deg)' },
        { transform: 'translateY(-15px) rotate(1deg)' },
        { transform: 'translateY(0px) rotate(0deg)' }
    ]

    const animation = element.animate(keyframes, {
        duration: defaultOptions.duration,
        delay: defaultOptions.delay,
        easing: defaultOptions.ease,
        iterations: Infinity
    })

    return animation
}

// Shimmer effect utility
export const createShimmerEffect = (element) => {
    if (!element) return

    const shimmer = document.createElement('div')
    shimmer.className = 'absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent'
    shimmer.style.transition = 'transform 1s ease-in-out'
    
    element.style.position = 'relative'
    element.style.overflow = 'hidden'
    element.appendChild(shimmer)

    const triggerShimmer = () => {
        shimmer.style.transform = 'translateX(100%)'
        setTimeout(() => {
            shimmer.style.transform = 'translateX(-100%)'
        }, 100)
    }

    element.addEventListener('mouseenter', triggerShimmer)
    
    return () => {
        element.removeEventListener('mouseenter', triggerShimmer)
        element.removeChild(shimmer)
    }
}

// Magnetic effect utility
export const createMagneticEffect = (element, intensity = 0.3) => {
    if (!element) return

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e
        const { left, top, width, height } = element.getBoundingClientRect()
        
        const x = (clientX - left - width / 2) * intensity
        const y = (clientY - top - height / 2) * intensity
        
        element.style.transform = `translate(${x}px, ${y}px)`
    }

    const handleMouseLeave = () => {
        element.style.transform = 'translate(0px, 0px)'
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
        element.removeEventListener('mousemove', handleMouseMove)
        element.removeEventListener('mouseleave', handleMouseLeave)
    }
}

// Debounce utility for performance
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Throttle utility for performance
export const throttle = (func, limit) => {
    let inThrottle
    return function() {
        const args = arguments
        const context = this
        if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

// Format number with commas
export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Generate random ID
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9)
}

// Check if element is in viewport
export const isInViewport = (element) => {
    const rect = element.getBoundingClientRect()
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
}

// Smooth scroll to top
export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}
