import {
    RiBusFill,
    RiCarFill,
    RiCheckLine,
    RiMailFill,
    RiMapPin2Fill,
    RiPhoneFill,
    RiTrainFill
} from '@remixicon/react';

const Location = () => {
    const locationData = [
        {
            name: "Swagat Group of Institutions - Sargiguda",
            address: "Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, Pin-767039",
            phone: "+91 7855959544",
            email: "contact@swagatodisha.com",
            coordinates: { lat: 20.099885, lng: 82.677498 }
        },
        {
            name: "Swagat Group of Institutions - Ghantiguda",
            address: "Ghantiguda, PO - Chalna, PS - Sinapali, Nuapada, Odisha, Pin-766108",
            phone: "+91 7855959544",
            email: "contact@swagatodisha.com",
            coordinates: { lat: 20.099885, lng: 82.677498 }
        }
    ]

    return (
        <section id="location" className="relative w-full py-20 overflow-hidden bg-white dark:bg-[#1A1212]">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#F0E6FA]/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D0E8F0]/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#F0E6FA]/20 to-[#D0E8F0]/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 pb-12">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#4A1D7A] rounded-3xl mb-6 shadow-2xl">
                        <RiMapPin2Fill size={36} className="text-white" />
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                        Our <span className="text-transparent bg-clip-text bg-[#4A1D7A]">Locations</span>
                    </h2>

                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
                        Visit us at our state-of-the-art campuses in Sargiguda, Kantabanji, Balangir and Ghantiguda, Sinapali, Nuapada, Odisha
                    </p>

                    {/* Maps Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {locationData.map((location, index) => (
                            <div key={index} className="bg-white dark:bg-[#231A2E] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{location.name}</h3>

                                <div className="relative w-full h-64 mb-6 rounded-xl overflow-hidden shadow-inner">
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

                                <div className="space-y-3 px-2">
                                    <div className="flex items-start gap-3">
                                        <RiMapPin2Fill size={20} className="text-[#4A1D7A] dark:text-[#9B6FCC] flex-shrink-0 mt-1" />
                                        <span className="text-gray-700 dark:text-gray-200 leading-relaxed">{location.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RiPhoneFill size={20} className="text-[#4A1D7A] dark:text-[#9B6FCC] flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-200">{location.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RiMailFill size={20} className="text-[#4A1D7A] dark:text-[#9B6FCC] flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-200">{location.email}</span>
                                    </div>
                                </div>

                                <div className="mt-6 text-center">
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block w-full py-3 bg-[#4A1D7A] text-white rounded-xl font-bold hover:bg-[#351458] transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        Get Directions
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Information Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20 max-w-6xl mx-auto text-left">
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
                                Why Choose Our <span className="text-transparent bg-clip-text bg-[#4A1D7A]">Location</span>
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-[#4A1D7A] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                        <RiCheckLine size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Strategic Locations</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Located in Sargiguda, Kantabanji and Ghantiguda, Sinapali with easy access to major transportation routes</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-[#E8A817] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                        <RiCheckLine size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Modern Infrastructure</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">State-of-the-art facilities with the latest technology and amenities</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-[#1D4B5E] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                        <RiCheckLine size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Safe Environment</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Secure campus with 24/7 security and a peaceful learning environment</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#F0E6FA] to-[#D0E8F0] dark:from-[#4A1D7A]/10 dark:to-[#1D4B5E]/10 rounded-3xl p-8 border border-white/40 dark:border-white/5 shadow-xl">
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Plan Your Visit</h4>

                            <div className="space-y-4">
                                <div className="flex items-center gap-5 p-4 bg-white/70 dark:bg-[#231A2E]/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 dark:border-gray-700">
                                    <div className="w-12 h-12 bg-[#4A1D7A]/10 dark:bg-[#9B6FCC]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <RiBusFill size={24} className="text-[#4A1D7A] dark:text-[#9B6FCC]" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-800 dark:text-gray-100">By Bus</h5>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Kantabanji Bus Stand - 15 minutes drive</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 p-4 bg-white/70 dark:bg-[#231A2E]/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 dark:border-gray-700">
                                    <div className="w-12 h-12 bg-[#1D4B5E]/10 dark:bg-[#387B95]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <RiCarFill size={24} className="text-[#1D4B5E] dark:text-[#387B95]" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-800 dark:text-gray-100">By Car</h5>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">NH 26 via Kantabanji - Easy access</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 p-4 bg-white/70 dark:bg-[#231A2E]/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 dark:border-gray-700">
                                    <div className="w-12 h-12 bg-[#E8A817]/10 dark:bg-[#E8A817]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <RiTrainFill size={24} className="text-[#E8A817]" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-800 dark:text-gray-100">By Train</h5>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Kantabanji Station - 20 minutes drive</p>
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

