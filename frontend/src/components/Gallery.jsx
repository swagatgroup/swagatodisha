import {useState, useEffect} from 'react';
import BackToMainWebsite from './BackToMainWebsite'

const Gallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedImage, setSelectedImage] = useState(null)
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/gallery/public?limit=100`);
                const json = await res.json();
                if (json.success) {
                    // Map backend schema to frontend schema
                    const mapped = json.data.map(img => ({
                        id: img._id,
                        src: img.imageUrl,
                        alt: img.title || 'Gallery Image',
                        category: img.category ? img.category.toLowerCase() : 'campus',
                        title: img.title || ''
                    }));
                    setGalleryImages(mapped);
                }
            } catch (err) {
                console.error('Error fetching gallery:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const categories = [
        { id: 'all', name: 'All Photos', icon: 'fa-solid fa-images' },
        { id: 'campus', name: 'Campus Life', icon: 'fa-solid fa-school' },
        { id: 'events', name: 'Events', icon: 'fa-solid fa-calendar' },
        { id: 'students', name: 'Students', icon: 'fa-solid fa-user-graduate' },
        { id: 'faculty', name: 'Faculty', icon: 'fa-solid fa-chalkboard-user' },
        { id: 'infrastructure', name: 'Infrastructure', icon: 'fa-solid fa-building' }
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

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-purple-600"><i className="fa-solid fa-spinner fa-spin text-3xl"></i></div>;
    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            <BackToMainWebsite variant="floating" />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#EDE0F7]/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#7B3FA0] rounded-3xl mb-6 shadow-2xl">
                        <i className="fa-solid fa-images text-white text-3xl"></i>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                        Our <span className="text-transparent bg-clip-text bg-[#7B3FA0]">Gallery</span>
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
                                    ? 'bg-[#7B3FA0] text-white shadow-lg'
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
                            <div className="w-20 h-20 bg-[#7B3FA0] rounded-2xl flex items-center justify-center mx-auto mb-4">
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
            <section className="py-20 bg-[#7B3FA0]">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Experience Our <span className="text-yellow-300">Campus</span> Life
                    </h2>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
                        See is believing! Browse through our gallery to get a real feel of the vibrant atmosphere
                        and world-class facilities at Swagat Group of Institutions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-white text-[#7B3FA0] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                            Schedule a Visit
                        </button>
                        <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-[#7B3FA0] transition-all duration-300">
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
