import React from 'react'

const QuickLinks = ({ links }) => {
    return (
        <section className="fa2 mb-8">
            <div className="container-main">
                {links.map((link) => (
                    <a
                        key={link.id}
                        href={link.href}
                        className="font-['Work_Sans'] font-semibold tracking-wider text-lg w-1/4 h-auto text-center text-decoration-none text-white flex flex-col justify-center items-center py-2 pb-4"
                        style={{ backgroundColor: link.color }}
                    >
                        <img
                            src={link.icon}
                            alt=""
                            className="w-1/4 m-4 rounded-full shadow-[0_0_10px_0_rgba(0,0,0,0.8)] transition-all duration-700 ease-in-out scale-100 hover:scale-95 hover:shadow-none"
                        />
                        <p>{link.name}</p>
                    </a>
                ))}
            </div>
        </section>
    )
}

export default QuickLinks
