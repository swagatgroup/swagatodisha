import React, { useState } from 'react'

const Gallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedImage, setSelectedImage] = useState(null)

    const categories = [
        { id: 'all', name: 'All Photos', icon: 'fa-solid fa-images' },
        { id: 'campus', name: 'Campus Life', icon: 'fa-solid fa-school' },
        { id: 'events', name: 'Events', icon: 'fa-solid fa-calendar' },
        { id: 'students', name: 'Students', icon: 'fa-solid fa-user-graduate' },
        { id: 'faculty', name: 'Faculty', icon: 'fa-solid fa-chalkboard-user' },
        { id: 'infrastructure', name: 'Infrastructure', icon: 'fa-solid fa-building' }
    ]

    const galleryImages = [
        // Campus Life
        { id: 1, src: '/slider1.jpg', alt: 'Campus View', category: 'campus', title: 'Beautiful Campus View' },
        { id: 2, src: '/slider2.jpg', alt: 'Library', category: 'campus', title: 'Modern Library' },
        { id: 3, src: '/slider3.jpg', alt: 'Laboratory', category: 'campus', title: 'Well-equipped Laboratory' },
        { id: 4, src: '/slider4.jpg', alt: 'Classroom', category: 'campus', title: 'Smart Classroom' },
        { id: 5, src: '/slider1.jpg', alt: 'Sports Ground', category: 'campus', title: 'Sports Ground' },
        { id: 6, src: '/slider2.jpg', alt: 'Auditorium', category: 'campus', title: 'State-of-the-art Auditorium' },

        // Events
        { id: 7, src: '/chairman.jpg', alt: 'Annual Day', category: 'events', title: 'Annual Day Celebration' },
        { id: 8, src: '/chairman_rk.jpg', alt: 'Cultural Festival', category: 'events', title: 'Cultural Festival' },
        { id: 9, src: '/cmsg_img_01.jpg', alt: 'Sports Meet', category: 'events', title: 'Annual Sports Meet' },
        { id: 10, src: '/Milestone_001.jpg', alt: 'Graduation Day', category: 'events', title: 'Graduation Ceremony' },

        // Students
        { id: 11, src: '/mnt_002.jpg', alt: 'Student Activities', category: 'students', title: 'Student Activities' },
        { id: 12, src: '/mnt_003.jpg', alt: 'Study Group', category: 'students', title: 'Study Group Session' },
        { id: 13, src: '/mnt_004.jpg', alt: 'Student Project', category: 'students', title: 'Student Project Presentation' },
        { id: 14, src: '/mnt_006.jpg', alt: 'Student Achievement', category: 'students', title: 'Student Achievement Award' },

        // Faculty
        { id: 15, src: '/chairman.jpg', alt: 'Faculty Meeting', category: 'faculty', title: 'Faculty Meeting' },
        { id: 16, src: '/chairman_rk.jpg', alt: 'Teaching Session', category: 'faculty', title: 'Interactive Teaching Session' },

        // Infrastructure
        { id: 17, src: '/slider1.jpg', alt: 'Computer Lab', category: 'infrastructure', title: 'Computer Laboratory' },
        { id: 18, src: '/slider2.jpg', alt: 'Science Lab', category: 'infrastructure', title: 'Science Laboratory' },
        { id: 19, src: '/slider3.jpg', alt: 'Library Interior', category: 'infrastructure', title: 'Library Interior' },
        { id: 20, src: '/slider4.jpg', alt: 'Cafeteria', category: 'infrastructure', title: 'Student Cafeteria' }
    ]

    const filteredImages = selectedCategory === 'all'
        ? galleryImages
        : galleryImages.filter(image => image.category === selectedCategory)

    const openLightbox = (image) => {
        setSelectedImage(image)
    }

    const closeLightbox = () => {
        setSelectedImage(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                        <i className="fa-solid fa-images text-white text-3xl"></i>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Gallery</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Explore the vibrant life at Swagat Group of Institutions through our comprehensive photo gallery.
                        From campus views to student activities, discover what makes our institution special.
                    </p>
                </div>
            </section>

            {/* Category Filter */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-4">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <i className={category.icon}></i>
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {filteredImages.map((image) => (
                            <div
                                key={image.id}
                                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                onClick={() => openLightbox(image)}
                            >
                                <div className="aspect-square overflow-hidden">
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                        <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                                        <p className="text-sm text-gray-200 capitalize">{image.category}</p>
                                    </div>
                                </div>

                                {/* Zoom Icon */}
                                <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <i className="fa-solid fa-search-plus text-white"></i>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredImages.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i className="fa-solid fa-image text-gray-400 text-3xl"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Images Found</h3>
                            <p className="text-gray-500">Try selecting a different category or check back later.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-images text-white text-2xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-2">{galleryImages.length}+</h3>
                            <p className="text-gray-600">Total Photos</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-school text-white text-2xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-2">6</h3>
                            <p className="text-gray-600">Categories</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-calendar text-white text-2xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-2">365</h3>
                            <p className="text-gray-600">Days of Memories</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-heart text-white text-2xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-2">100%</h3>
                            <p className="text-gray-600">Quality Content</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Experience Our <span className="text-yellow-300">Campus</span> Life
                    </h2>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
                        See is believing! Browse through our gallery to get a real feel of the vibrant atmosphere
                        and world-class facilities at Swagat Group of Institutions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                            Schedule a Visit
                        </button>
                        <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300">
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 z-10"
                        >
                            <i className="fa-solid fa-times text-xl"></i>
                        </button>

                        <img
                            src={selectedImage.src}
                            alt={selectedImage.alt}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />

                        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
                            <h3 className="text-xl font-bold mb-1">{selectedImage.title}</h3>
                            <p className="text-sm text-gray-200 capitalize">{selectedImage.category}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Gallery
