import React from 'react'

const VideoIntro = ({ video }) => {
    return (
        <section id="about-us" className="video-intro flex flex-wrap justify-between py-32 bg-gradient-to-r from-[#4cc8bb] to-[#4c4cc8]">
            {/* Video Area */}
            <div className="video-area w-1/2 flex justify-center min-w-[400px]">
                <video controls autoPlay loop className="w-[26rem] h-auto">
                    <source src={video.videoUrl} type="video/mp4" />
                </video>
            </div>

            {/* Video Text Area */}
            <div className="video-textarea w-[45%] min-w-[400px] text-whitesmoke">
                <h1 className="transition-all duration-700 ease-in-out hover:tracking-[1.5px] hover:skew-x-[-15deg]">
                    {video.title}
                </h1>
                <p className="w-[91%]">
                    {video.description}
                </p>
                <h4 className="text-whitesmoke">
                    {video.locations.map((location, index) => (
                        <span key={index} className="transform scale-100 text-base transition-all duration-300 ease-in-out hover:scale-[1.3] hover:text-lg hover:text-[#caf705] cursor-pointer">
                            {location}
                            {index < video.locations.length - 1 && ' | '}
                        </span>
                    ))}
                </h4>
            </div>
        </section>
    )
}

export default VideoIntro
