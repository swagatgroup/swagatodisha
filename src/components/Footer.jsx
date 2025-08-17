import React from 'react'
import { SOCIAL_LINKS } from '../utils/constants'

const Footer = () => {
    return (
        <footer className="flex flex-col flex-wrap overflow-hidden bg-gradient-to-b from-[#4747e9] via-[#4444e5] to-[#4c4cc8] p-8 pt-8 pb-0">
            {/* Footer Top */}
            <div className="footer-top flex justify-between pb-4">
                {/* Area 1 - Logo */}
                <div className="f-top-area1 relative flex flex-row justify-center items-center text-white">
                    <div className="f-logo-wrapper flex flex-row h-10">
                        <img
                            src="/img/open-book.png"
                            alt="Swagat Odisha"
                            className="relative w-24 h-24 mt-[-2rem] max-w-[200%] p-0.5 filter brightness-0 invert"
                        />
                    </div>
                    <div className="f-logo-text z-5 text-center ml-4">
                        <h1 className="m-0 text-left">Swagat</h1>
                        <h4 className="text-lg text-left">Group of Institutions</h4>
                    </div>
                </div>

                {/* Area 2 - Social Links */}
                <div className="f-top-area2 mr-8 relative flex flex-col justify-center items-center text-white">
                    <h2 className="text-4xl mb-0">Follow Us</h2>
                    <div className="social-bottom flex p-1 justify-between items-center">
                        <a
                            href="https://facebook.com/swagatodisha"
                            target="_blank"
                            className="rounded-[10px] text-white transition-all duration-300 ease-in-out hover:text-white hover:shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                        >
                            <i className="fa-brands fa-facebook p-2 text-2xl"></i>
                        </a>
                        <a
                            href="https://twitter.com/SwagatOdisha"
                            target="_blank"
                            className="rounded-[10px] text-white transition-all duration-300 ease-in-out hover:text-white hover:shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                        >
                            <i className="fa-brands fa-twitter p-2 text-2xl"></i>
                        </a>
                        <a
                            href="https://youtube.com/channel/UCQ5GY_dOSPmyhOeUkq61R1w"
                            target="_blank"
                            className="rounded-[10px] text-white transition-all duration-300 ease-in-out hover:text-white hover:shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                        >
                            <i className="fa-brands fa-youtube p-2 text-2xl"></i>
                        </a>
                        <a
                            href="https://instagram.com/Swagat_Odisha"
                            target="_blank"
                            className="rounded-[10px] text-white transition-all duration-300 ease-in-out hover:text-white hover:shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                        >
                            <i className="fa-brands fa-instagram p-2 text-2xl"></i>
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer Gap */}
            <div className="footer-gap w-full m-0 mx-auto bg-[rgba(255,255,255,0.682)] h-px"></div>

            {/* Footer Bottom */}
            <div className="footer-bottom flex justify-between text-white m-4">
                <p className="pt-2 mb-0">
                    Copyright © 2022 Swagat Odisha • All Rights Reserved
                </p>
                <ul className="flex">
                    <li className="list-none p-2 transition-colors duration-500 ease-in-out">
                        <a href="/" className="text-decoration-none text-white">Home</a>
                    </li>
                    <li className="list-none p-2 transition-colors duration-500 ease-in-out">
                        <a href="#about-us" className="text-decoration-none text-white">About Us</a>
                    </li>
                    <li className="list-none p-2 transition-colors duration-500 ease-in-out">
                        <a href="#" className="text-decoration-none text-white">Contact Us</a>
                    </li>
                    <li className="list-none p-2 transition-colors duration-500 ease-in-out">
                        <a href="#" className="text-decoration-none text-white">Privacy Policy</a>
                    </li>
                </ul>
            </div>
        </footer>
    )
}

export default Footer
