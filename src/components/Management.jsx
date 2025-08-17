import React from 'react'

const Management = ({ team }) => {
    return (
        <section className="mnt flex flex-col justify-evenly items-center overflow-hidden p-8">
            {/* Title Area */}
            <div className="mnt-title-area flex flex-col justify-center items-center text-[#4c4cc8] font-light mb-4">
                <i className="fa-solid fa-people-group text-5xl"></i>
                <h1 className="text-4xl">Management</h1>
                <h2 className="font-['Work_Sans'] text-center w-full text-xl">The Men Behind This Success</h2>
            </div>

            {/* Image Area */}
            <div className="mnt-image-area flex flex-row flex-wrap justify-center items-center">
                {team.map((member) => (
                    <div key={member.id} className="mnt-images flex flex-col justify-center items-center w-1/3 m-0 mx-auto min-w-[15rem]">
                        <div className="mnt-images-wrapper w-52 bg-transparent overflow-hidden">
                            <img
                                src={member.image}
                                alt="Management Officials' Photos"
                                className="w-52 mt-4 rounded-full transform scale-100 transition-all duration-700 ease-in-out hover:scale-110 hover:translate-y-5 hover:rounded-br-none hover:rounded-bl-none"
                            />
                        </div>
                        <h2 className="text-2xl mt-2">{member.name}</h2>
                        <h4 className="text-base transition-colors duration-500 ease-in-out hover:cursor-pointer hover:text-[#4c4cc8]">
                            {member.position}
                        </h4>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Management
