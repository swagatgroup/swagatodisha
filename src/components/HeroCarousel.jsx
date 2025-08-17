import React, { useState, useEffect } from 'react'

const HeroCarousel = ({ images }) => {
    const [currentSlide, setCurrentSlide] = useState(0)

    // Auto-advance carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length)
        }, 5000) // Change slide every 5 seconds

        return () => clearInterval(timer)
    }, [images.length])

    const goToSlide = (index) => {
        setCurrentSlide(index)
    }

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
    }

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length)
    }

    return (
        <div id="hero">
            <div id="carouselExampleControls" className="carousel slide relative">
                <div className="carousel-inner relative w-full overflow-hidden">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`carousel-item ${index === currentSlide ? 'active' : ''} relative float-left w-full`}
                        >
                            <img
                                src={image}
                                className="d-block w-full"
                                alt={`${index + 1}st Slider image`}
                            />
                        </div>
                    ))}
                </div>

                {/* Previous Button */}
                <button
                    className="carousel-control-prev absolute top-0 bottom-0 left-0 flex items-center justify-center w-[15%] p-0 text-center border-0 hover:outline-none hover:no-underline focus:outline-none focus:no-underline"
                    type="button"
                    onClick={goToPrevious}
                >
                    <span className="carousel-control-prev-icon inline-block bg-no-repeat" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>

                {/* Next Button */}
                <button
                    className="carousel-control-next absolute top-0 bottom-0 right-0 flex items-center justify-center w-[15%] p-0 text-center border-0 hover:outline-none hover:no-underline focus:outline-none focus:no-underline"
                    type="button"
                    onClick={goToNext}
                >
                    <span className="carousel-control-next-icon inline-block bg-no-repeat" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
        </div>
    )
}

export default HeroCarousel
