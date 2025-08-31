import React, { useState } from 'react'

const Location = () => {
    const [mapType, setMapType] = useState('roadmap') // 'roadmap', 'satellite', 'hybrid', 'terrain'

    const locationData = [
        {
            name: "Swagat Group of Institutions - Sargiguda",
            address: "Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, Pin-767039",
            phone: "+91 9403891555",
            email: "contact@swagatodisha.com",
            coordinates: {
                lat: 20.099885,
                lng: 82.677498
            }
        },
        {
            name: "Swagat Group of Institutions - Ghantiguda",
            address: "Ghantiguda, PO - Chalna, PS - Sinapali, Nuapada, Odisha, Pin-766108",
            phone: "+91 9403891555",
            email: "contact@swagatodisha.com",
            coordinates: {
                lat: 20.099885,
                lng: 82.677498
            }
        }
    ]

    // Generate proper Google Maps URL with different view options
    const getMapUrl = (type) => {
        const baseUrl = "https://www.google.com/maps/embed/v1"
        const key = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8" // Google Maps API key
        const location = `${locationData[0].coordinates.lat},${locationData[0].coordinates.lng}`

        switch (type) {
            case 'satellite':
                return `${baseUrl}/view?key=${key}&center=${location}&zoom=16&maptype=satellite`
            default:
                return `${baseUrl}/view?key=${key}&center=${location}&zoom=16&maptype=roadmap`
        }
    }

    const mapTypes = [
        { id: 'roadmap', name: 'Road', icon: 'fa-solid fa-road' },
        { id: 'satellite', name: 'Satellite', icon: 'fa-solid fa-satellite' }
    ]

    return (
        <section className="relative w-full min-h-screen overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
            </div>

            {/* Section Header */}
            <div className="relative z-10 pb-12">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                        <i className="fa-solid fa-map-marker-alt text-white text-3xl"></i>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Location</span>
                    </h2>

                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                        Visit us at our state-of-the-art campuses in Sargiguda, Kantabanji, Balangir and Ghantiguda, Sinapali, Nuapada, Odisha
                    </p>

                    {/* Location Info Cards - Two Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
                        {locationData.map((location, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <i className="fa-solid fa-map-marker-alt text-white text-2xl"></i>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{location.name}</h3>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                            <i className="fa-solid fa-map-marker-alt text-purple-600 text-lg"></i>
                                        </div>
                                        <div className='text-left'>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-1">Address</h4>
                                            <p className="text-gray-600 leading-relaxed">{location.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                            <i className="fa-solid fa-phone text-purple-600 text-lg"></i>
                                        </div>
                                        <div className='text-left'>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-1">Phone</h4>
                                            <p className="text-gray-600">{location.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                            <i className="fa-solid fa-envelope text-purple-600 text-lg"></i>
                                        </div>
                                        <div className='text-left'>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-1">Email</h4>
                                            <p className="text-gray-600">{location.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Small Maps Section - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {locationData.map((location, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{location.name}</h3>

                        {/* Small Map */}
                        <div className="relative w-full h-64 mb-4 rounded-xl overflow-hidden">
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${location.coordinates.lat},${location.coordinates.lng}&zoom=15&maptype=roadmap`}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`${location.name} Location`}
                            ></iframe>
                        </div>

                        {/* Location Info */}
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <i className="fa-solid fa-map-marker-alt text-purple-600 mr-3"></i>
                                <span className="text-gray-700">{location.address}</span>
                            </div>
                            <div className="flex items-center">
                                <i className="fa-solid fa-phone text-purple-600 mr-3"></i>
                                <span className="text-gray-700">{location.phone}</span>
                            </div>
                            <div className="flex items-center">
                                <i className="fa-solid fa-envelope text-purple-600 mr-3"></i>
                                <span className="text-gray-700">{location.email}</span>
                            </div>
                        </div>

                        {/* Get Directions Button */}
                        <div className="mt-4 text-center">
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Get Directions
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Information Section */}
            <div className="relative z-10 py-16">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-6">
                                Why Choose Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Location</span>
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                                        <i className="fa-solid fa-check text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-1">Strategic Locations</h4>
                                        <p className="text-gray-600 text-sm">Located in Sargiguda, Kantabanji and Ghantiguda, Sinapali with easy access to major transportation routes</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                                        <i className="fa-solid fa-check text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-1">Modern Infrastructure</h4>
                                        <p className="text-gray-600 text-sm">State-of-the-art facilities with the latest technology and amenities</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                                        <i className="fa-solid fa-check text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-1">Safe Environment</h4>
                                        <p className="text-gray-600 text-sm">Secure campus with 24/7 security and a peaceful learning environment</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border border-purple-100">
                            <h4 className="text-2xl font-bold text-gray-800 mb-6 text-center">Plan Your Visit</h4>

                            <div className="space-y-4">
                                <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                                    <i className="fa-solid fa-bus text-purple-600 text-xl mr-4"></i>
                                    <div>
                                        <h5 className="font-semibold text-gray-800">By Bus</h5>
                                        <p className="text-gray-600 text-sm">Kantabanji Bus Stand - 15 minutes drive</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                                    <i className="fa-solid fa-car text-blue-600 text-xl mr-4"></i>
                                    <div>
                                        <h5 className="font-semibold text-gray-800">By Car</h5>
                                        <p className="text-gray-600 text-sm">NH 26 via Kantabanji - Easy access from Balangir</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                                    <i className="fa-solid fa-train text-green-600 text-xl mr-4"></i>
                                    <div>
                                        <h5 className="font-semibold text-gray-800">By Train</h5>
                                        <p className="text-gray-600 text-sm">Kantabanji Railway Station - 20 minutes drive</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Location
