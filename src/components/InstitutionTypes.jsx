import React, { useState } from 'react'

const InstitutionTypes = ({ institutions }) => {
    const [activeDialog, setActiveDialog] = useState(null)

    const openDialog = (id) => {
        setActiveDialog(id)
    }

    const closeDialog = () => {
        setActiveDialog(null)
    }

    const getInstitutionLinks = (type) => {
        switch (type) {
            case 'School':
                return ['Swagat Public School Sinapali']
            case 'Higher Secondary School':
                return ['BBOSE', 'NIOS', 'Central Sanskrit University']
            case 'Degree College':
                return ['Capital University', 'YBN University', 'MATS University', 'J.S. University']
            case 'Management School':
                return ['Capital University', 'YBN University', 'MATS University', 'J.S. University']
            case 'Engineering College':
                return ['Capital University', 'YBN University', 'MATS University', 'J.S. University']
            case 'Polytechnic':
                return ['Capital University', 'YBN University', 'MATS University', 'J.S. University']
            case 'B.Ed. College':
                return ['Acharya Nagarjuna University', 'Andhra University', 'MATS University', 'Rayalaseema University']
            case 'Computer Academy':
                return ['RCTI', 'NCTI']
            default:
                return []
        }
    }

    const getInstitutionUrls = (institution) => {
        const urls = {
            'BBOSE': 'https://www.bbose.org/',
            'NIOS': 'https://www.nios.ac.in/',
            'Central Sanskrit University': 'http://www.sanskrit.nic.in/',
            'Capital University': 'https://capitaluniversity.edu.in/',
            'YBN University': 'http://www.ybnuniversity.in/',
            'MATS University': 'https://matsuniversity.ac.in/',
            'J.S. University': 'https://jsu.edu.in/',
            'Acharya Nagarjuna University': 'https://www.nagarjunauniversity.ac.in/',
            'Andhra University': 'https://www.andhrauniversity.edu.in/',
            'Rayalaseema University': 'https://www.rayalaseemauniversity.ac.in/',
            'RCTI': 'https://rcti.netlify.app'
        }
        return urls[institution] || '#'
    }

    return (
        <>
            <section className="fa1 relative px-4 pb-4">
                <div className="container-main">
                    {institutions.map((institution) => (
                        <button
                            key={institution.id}
                            className="fa1-item-1 w-[12.5%] h-48 flex justify-center items-center flex-col text-center text-decoration-none text-white leading-16 z-3 transition-transform duration-300 ease-in-out hover:translate-y-[-2rem] hover:shadow-[3px_3px_20px_1px_black] border-none cursor-pointer"
                            style={{ backgroundColor: institution.color }}
                            onClick={() => openDialog(institution.id)}
                        >
                            <i className={`fa-solid ${institution.icon} text-5xl`}></i>
                            <p className="w-[96%] text-sm h-4 mt-4 leading-6">{institution.name}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* Dialogs */}
            {institutions.map((institution) => (
                activeDialog === institution.id && (
                    <div key={institution.id} className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                        <div className="w-fit m-24 mx-auto border border-black rounded p-8 bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXKTjvWk-V0CrwXwHKVVqpSc1kvW2MuawVCw&usqp=CAU')] bg-no-repeat bg-center">
                            <ul className="flex flex-col justify-center items-start">
                                {getInstitutionLinks(institution.name).map((link, index) => (
                                    <li key={index} className="list-none">
                                        <a
                                            href={getInstitutionUrls(link)}
                                            target="_blank"
                                            className="flex text-[#4c4cc8] justify-center items-center text-decoration-none mb-4"
                                        >
                                            <i className="fa-solid fa-book-open align-middle text-[#4c4cc8] text-2xl"></i>
                                            <h3 className="m-0.5 ml-2 align-middle text-2xl hover:underline">{link}</h3>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <span
                                className="mt-4 p-1 px-2 bg-gradient-to-b from-[#4747e9] via-[#4444e5] to-[#4c4cc8] rounded text-white text-sm font-['Nunito'] cursor-pointer block w-[40%] m-0 mx-auto text-center"
                                onClick={() => closeDialog()}
                            >
                                Close Window
                            </span>
                        </div>
                    </div>
                )
            ))}
        </>
    )
}

export default InstitutionTypes
