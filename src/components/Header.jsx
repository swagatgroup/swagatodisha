import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { NAV_ITEMS } from '../utils/constants'

const Header = ({ isNavOpen, setIsNavOpen }) => {
    const [activeDropdown, setActiveDropdown] = useState(null)

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen)
    }

    const toggleDropdown = (index) => {
        setActiveDropdown(activeDropdown === index ? null : index)
    }

    return (
        <header className="flex justify-between items-center bg-gradient-to-b from-[#4747e9] via-[#4444e5] to-[#4c4cc8] text-white sticky top-0 z-50 w-full">
            {/* Navigation */}
            <nav className="flex">
                {/* Hamburger Menu */}
                <div
                    className={`hidden md:hidden flex-col w-full m-4 cursor-pointer ${isNavOpen ? 'nav-open' : ''}`}
                    onClick={toggleNav}
                >
                    <div className="w-7 h-1 m-0.5 bg-white rounded-lg transition-all duration-300 ease-in-out"></div>
                    <div className="w-7 h-1 m-0.5 bg-white rounded-lg transition-all duration-300 ease-in-out"></div>
                    <div className="w-7 h-1 m-0.5 bg-white rounded-lg transition-all duration-300 ease-in-out"></div>
                </div>

                {/* Navigation Menu */}
                <ul className={`flex md:flex ${isNavOpen ? 'fixed top-16 left-0 w-full pt-6 h-full z-40 flex-col bg-[#4c4cc8] transition-all duration-500 ease-in-out left-0' : 'hidden md:flex'}`}>
                    {NAV_ITEMS.map((item, index) => (
                        <li key={index} className="m-1.5 list-none">
                            {item.hasDropdown ? (
                                <div className="relative">
                                    <button
                                        className="text-white p-0 text-base border-none mb-0 ml-6 flex items-center justify-center flex-col"
                                        onClick={() => toggleDropdown(index)}
                                    >
                                        <i className={`fa-solid ${item.icon} text-white font-medium transition-colors duration-700 ease-in-out`}></i>
                                        <br />
                                        {item.name}
                                    </button>

                                    {/* Dropdown Content */}
                                    {activeDropdown === index && (
                                        <div className="absolute left-[-3.7rem] top-12 bg-[#f1f1f1] min-w-40 shadow-lg z-10 rounded">
                                            {item.name === 'Institutions' && (
                                                <>
                                                    <a href="#" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        Swagat Public School Sinapali
                                                    </a>
                                                    <a href="https://www.bbose.org/" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        BBOSE
                                                    </a>
                                                    <a href="https://www.nios.ac.in/" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        NIOS
                                                    </a>
                                                    <a href="http://www.sanskrit.nic.in/" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        Central Sanskrit University
                                                    </a>
                                                    <a href="https://capitaluniversity.edu.in/" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        Capital University
                                                    </a>
                                                    <a href="http://www.ybnuniversity.in/" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        YBN University
                                                    </a>
                                                    <a href="https://matsuniversity.ac.in/" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        MATS University
                                                    </a>
                                                    <a href="https://jsu.edu.in/" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        J.S. University
                                                    </a>
                                                    <a href="https://www.nagarjunauniversity.ac.in/" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        Acharya Nagarjuna University
                                                    </a>
                                                    <a href="https://www.andhrauniversity.edu.in/" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        Andhra University
                                                    </a>
                                                    <a href="https://www.rayalaseemauniversity.ac.in/" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        Rayalaseema University
                                                    </a>
                                                    <a href="https://rcti.netlify.app" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        RCTI
                                                    </a>
                                                    <a href="#" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-book-open mr-2"></i>
                                                        NCTI
                                                    </a>
                                                </>
                                            )}
                                            {item.name === 'Milestone' && (
                                                <div className="p-4">
                                                    <h3 className="text-[#4c4cc8] text-lg">2021</h3>
                                                    <h6 className="text-[#4c4cc8] text-sm">Building from Scratch #1 (Sinapali Public School)</h6>
                                                    <img src="/img/Milestone 001.jpg" alt="Swagat Group at early phase" className="w-96 m-4 rounded" />
                                                </div>
                                            )}
                                            {item.name === 'Contact Us' && (
                                                <>
                                                    <a href="tel:+916670356176" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-phone-flip mr-2"></i>
                                                        +91 6670356176
                                                    </a>
                                                    <a href="mailto:contact@swagatodisha.com" target="_blank" className="font-['Nunito'] text-black p-2.5 mt-2 rounded text-decoration-none block hover:bg-[#ddd]">
                                                        <i className="fa-solid fa-envelope mr-2"></i>
                                                        contact@swagatodisha.com
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <a
                                    href={item.href}
                                    className="font-['Nunito'] flex text-white text-decoration-none items-center flex-col leading-tight m-0 mx-2 transition-colors duration-500 ease-in-out hover:text-[#caf705]"
                                >
                                    <i className={`fa-solid ${item.icon} text-white font-medium transition-colors duration-700 ease-in-out`}></i>
                                    <br />
                                    {item.name}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logo */}
            <a href="/" className="relative flex flex-col justify-center items-center bg-white text-white overflow-y-clip text-decoration-none">
                <div className="flex flex-row h-10">
                    <img src="/img/open-book.png" alt="Swagat Odisha" className="relative w-12 max-w-[200%] p-0.5" />
                    <h1 className="text-[#4c4cc8] text-3xl z-10 font-bold m-0 mx-1.5 mb-1.5">Swagat</h1>
                </div>
                <div className="z-5 text-center">
                    <h4 className="text-[#4c4cc8] text-sm text-center tracking-wider m-0 pb-0.5">Group of Institutions</h4>
                    <h6 className="text-[#4c4cc8] text-xs text-center tracking-wider m-0 mx-1 mb-1">Education • Innovation • Revolution</h6>
                </div>
                {/* Logo background shape */}
                <div className="absolute w-[75px] right-[140px] h-[145px] bg-white transform rotate-[35deg]"></div>
            </a>
        </header>
    )
}

export default Header
