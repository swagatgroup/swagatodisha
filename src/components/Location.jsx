import React from 'react'

const Location = ({ location }) => {
    return (
        <section className="lcn flex flex-col justify-evenly items-center overflow-hidden p-8">
            {/* Title Area */}
            <div className="lcn-title-area flex flex-col justify-center items-center text-[#4c4cc8] font-light mb-4">
                <i className="fa-solid fa-location-dot text-5xl"></i>
                <h1 className="text-4xl">location</h1>
            </div>

            {/* Map Area */}
            <div className="Lcn-map-area">
                <iframe
                    src={location.mapUrl}
                    width="100vw"
                    height="65vh"
                    className="p-5"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Swagat Institute Location"
                ></iframe>
            </div>
        </section>
    )
}

export default Location
