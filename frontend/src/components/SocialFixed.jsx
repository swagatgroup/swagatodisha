import React from 'react'
import { SOCIAL_LINKS } from '../utils/constants'

const SocialFixed = () => {
    return (
        <section className="fixed top-[30%] right-0 z-40">
            <ul>
                <li className="list-none">
                    <a
                        href={`tel:${SOCIAL_LINKS.phone}`}
                        target="_blank"
                        className="flex justify-between items-center p-1 py-0 text-decoration-none bg-white text-[#4c4cc8] w-full border-b border-black relative right-[-5.3rem] transition-right duration-300 ease-in-out hover:right-0"
                    >
                        <i className="fa-solid fa-phone-flip m-2 mx-3"></i>
                        <span className="w-16 mr-4">Call</span>
                    </a>
                </li>
                <li className="list-none">
                    <a
                        href={`mailto:${SOCIAL_LINKS.email}`}
                        target="_blank"
                        className="flex justify-between items-center p-1 py-0 text-decoration-none bg-white text-[#4c4cc8] w-full border-b border-black relative right-[-5.3rem] transition-right duration-300 ease-in-out hover:right-0"
                    >
                        <i className="fa-solid fa-envelope m-2 mx-3"></i>
                        <span className="w-16 mr-4">E-Mail</span>
                    </a>
                </li>
                <li className="list-none">
                    <a
                        href={SOCIAL_LINKS.facebook}
                        target="_blank"
                        className="flex justify-between items-center p-1 py-0 text-decoration-none bg-white text-[#4c4cc8] w-full border-b border-black relative right-[-5.3rem] transition-right duration-300 ease-in-out hover:right-0"
                    >
                        <i className="fa-brands fa-facebook-f m-2 mx-3"></i>
                        <span className="w-16 mr-4">Facebook</span>
                    </a>
                </li>
                <li className="list-none">
                    <a
                        href={SOCIAL_LINKS.twitter}
                        target="_blank"
                        className="flex justify-between items-center p-1 py-0 text-decoration-none bg-white text-[#4c4cc8] w-full border-b border-black relative right-[-5.3rem] transition-right duration-300 ease-in-out hover:right-0"
                    >
                        <i className="fa-brands fa-twitter m-2 mx-3"></i>
                        <span className="w-16 mr-4">Twitter</span>
                    </a>
                </li>
                <li className="list-none">
                    <a
                        href={SOCIAL_LINKS.instagram}
                        target="_blank"
                        className="flex justify-between items-center p-1 py-0 text-decoration-none bg-white text-[#4c4cc8] w-full border-b border-black relative right-[-5.3rem] transition-right duration-300 ease-in-out hover:right-0"
                    >
                        <i className="fa-brands fa-instagram m-2 mx-3"></i>
                        <span className="w-16 mr-4">Instagram</span>
                    </a>
                </li>
                <li className="list-none">
                    <a
                        href={SOCIAL_LINKS.youtube}
                        target="_blank"
                        className="flex justify-between items-center p-1 py-0 text-decoration-none bg-white text-[#4c4cc8] w-full border-b border-black relative right-[-5.3rem] transition-right duration-300 ease-in-out hover:right-0"
                    >
                        <i className="fa-brands fa-youtube m-2 mx-3"></i>
                        <span className="w-16 mr-4">Youtube</span>
                    </a>
                </li>
                <li className="list-none">
                    <a
                        href={SOCIAL_LINKS.linkedin}
                        target="_blank"
                        className="flex justify-between items-center p-1 py-0 text-decoration-none bg-white text-[#4c4cc8] w-full border-b border-black relative right-[-5.3rem] transition-right duration-300 ease-in-out hover:right-0"
                    >
                        <i className="fa-brands fa-linkedin m-2 mx-3"></i>
                        <span className="w-16 mr-4">Linkedin</span>
                    </a>
                </li>
            </ul>
        </section>
    )
}

export default SocialFixed
