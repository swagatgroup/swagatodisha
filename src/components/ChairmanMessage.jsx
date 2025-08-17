import React from 'react'

const ChairmanMessage = ({ message }) => {
    return (
        <section className="cmsg flex justify-between items-center m-0 mx-auto pb-4 w-full max-w-[1150px]">
            {/* First Section - Chairman Message */}
            <div className="first-sec flex w-[30%] min-w-[300px] m-8 mt-8 ml-4 flex-col justify-center items-center overflow-hidden">
                <img
                    src={message.image}
                    alt="Photo of the Chairman"
                    className="w-28 rounded-full mb-4"
                />
                <h1 className="text-2xl w-[60%] m-0 mx-auto text-center mb-4">Message from Chairman</h1>
                <h4 className="text-base self-start text-[#4c4cc8] m-0 mb-4 ml-4">– {message.name}</h4>
                <p className="m-0 mr-4 mb-4 ml-2">{message.message}</p>
            </div>

            {/* Second Section - Building Gallery */}
            <div className="second-sec flex justify-around w-1/2 mr-36 mt-[-5rem]">
                {/* Line 1 */}
                <div className="cm-line1 cm-lines w-20 rotate-[45deg]">
                    <div className="area4cmsg w-28 m-4 rotate-0 overflow-hidden relative bottom-0 z-1 transition-bottom duration-700 ease-in-out hover:bottom-2">
                        <img src="/img/cmsg img 01.jpg" alt="Area for cms image" className="w-28 rotate-[-45deg] z-2" />
                    </div>
                    <div className="area4cmsg w-28 m-4 rotate-0 overflow-hidden relative bottom-0 z-1 transition-bottom duration-700 ease-in-out hover:bottom-2">
                        <img src="/img/cmsg img 01.jpg" alt="Area for cms image" className="w-28 rotate-[-45deg] z-2" />
                    </div>
                    <div className="area4cmsg w-28 m-4 rotate-0 overflow-hidden relative bottom-0 z-1 transition-bottom duration-700 ease-in-out hover:bottom-2">
                        <img src="/img/cmsg img 01.jpg" alt="Area for cms image" className="w-28 rotate-[-45deg] z-2" />
                    </div>
                </div>

                {/* Line 2 */}
                <div className="cm-line2 cm-lines w-20 rotate-[45deg]">
                    <div className="area4cmsg w-28 m-4 rotate-0 overflow-hidden relative bottom-0 z-1 transition-bottom duration-700 ease-in-out hover:bottom-2">
                        <img src="/img/cmsg img 01.jpg" alt="Area for cms image" className="w-28 rotate-[-45deg] z-2" />
                    </div>
                    <div className="area4cmsg w-28 m-4 rotate-0 overflow-hidden relative bottom-0 z-1 transition-bottom duration-700 ease-in-out hover:bottom-2">
                        <img src="/img/cmsg img 01.jpg" alt="Area for cms image" className="w-28 rotate-[-45deg] z-2" />
                    </div>
                    <div className="area4cmsg w-28 m-4 rotate-0 overflow-hidden relative bottom-0 z-1 transition-bottom duration-700 ease-in-out hover:bottom-2">
                        <img src="/img/cmsg img 01.jpg" alt="Area for cms image" className="w-28 rotate-[-45deg] z-2" />
                    </div>
                </div>

                {/* Line 3 */}
                <div className="cm-line3 cm-lines w-20 rotate-[45deg]">
                    <div className="area4cmsg w-28 m-4 rotate-0 overflow-hidden relative bottom-0 z-1 transition-bottom duration-700 ease-in-out hover:bottom-2">
                        <img src="/img/cmsg img 01.jpg" alt="Area for cms image" className="w-28 rotate-[-45deg] z-2" />
                    </div>
                    <div className="area4cmsg w-28 m-4 rotate-0 overflow-hidden relative bottom-0 z-1 transition-bottom duration-700 ease-in-out hover:bottom-2">
                        <img src="/img/cmsg img 01.jpg" alt="Area for cms image" className="w-28 rotate-[-45deg] z-2" />
                    </div>
                    <div className="area4cmsg w-28 m-4 rotate-0 overflow-hidden relative bottom-0 z-1 transition-bottom duration-700 ease-in-out hover:bottom-2">
                        <img src="/img/cmsg img 01.jpg" alt="Area for cms image" className="w-28 rotate-[-45deg] z-2" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ChairmanMessage
