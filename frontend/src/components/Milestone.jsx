import React from 'react'
import { MILESTONE } from '../utils/constants'

const Milestone = () => {
    return (
        <section id="milestone" className="py-20 bg-gradient-to-br from-purple-600 to-blue-600">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Our <span className="text-yellow-300">Milestone</span>
                    </h2>
                    <p className="text-xl text-white/90 max-w-3xl mx-auto">
                        Celebrating the journey of growth and success in education
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                        <div className="text-center mb-8">
                            <div className="inline-block bg-yellow-300 text-purple-800 px-6 py-2 rounded-full text-2xl font-bold mb-4">
                                {MILESTONE.year}
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">
                                {MILESTONE.title}
                            </h3>
                            <p className="text-white/90 text-lg">
                                {MILESTONE.description}
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <img
                                src={MILESTONE.image}
                                alt={MILESTONE.description}
                                className="w-full max-w-2xl rounded-xl shadow-2xl"
                            />
                        </div>

                        <div className="text-center mt-8">
                            <div className="inline-flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-full">
                                <i className="fa-solid fa-flag text-yellow-300 text-xl"></i>
                                <span className="text-white font-semibold">A Historic Beginning</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Milestone
