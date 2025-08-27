import React from 'react'

const ArrowUp = ({ onClick }) => {
    return (
        <section id="arrow-up" className="arrow-up">
            <i
                className="fa-solid fa-circle-arrow-up cursor-pointer text-white text-3xl fixed bottom-[6%] right-[5%] z-[1000] bg-[#4c4cc8] rounded-full shadow-[0px_3px_5px_black]"
                onClick={onClick}
            ></i>
        </section>
    )
}

export default ArrowUp
