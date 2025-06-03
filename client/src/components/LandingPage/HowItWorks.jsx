import React from 'react'
import { FaUserEdit, FaRegClock, FaCheckCircle, FaChartLine, FaArrowRight } from 'react-icons/fa'

function HowItWorks() {

    const steps = [
        {
            icon: <FaUserEdit size={50} className="text-blue-600" />,
            title: 'Enter Details',
            desc: 'Fill in your Name, USN, and College to get started.'
        },
        {
            icon: <FaRegClock size={50} className="text-green-600" />,
            title: 'Attempt Weekly Test',
            desc: 'Take a test at your convenience anytime within the week.'
        },
        {
            icon: <FaCheckCircle size={50} className="text-purple-600" />,
            title: 'Get Instant Result',
            desc: 'Submit and instantly receive your test score & feedback.'
        },
        {
            icon: <FaChartLine size={50} className="text-red-600" />,
            title: 'Track Your Progress',
            desc: 'See your improvement over time and aim higher.'
        },
    ]

    return (
        <div className="py-10 px-4 ">
            <h1 className="text-3xl text-red-800 text-center font-bold mb-10">
                How It Works
            </h1>

            <div className="flex flex-wrap justify-center items-center gap-6">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="w-64 p-6 bg-white shadow-md rounded-xl text-center hover:scale-105 transition duration-300">
                            <div className="mb-4 flex justify-center">{step.icon}</div>
                            <h2 className="text-xl font-bold mb-2">{step.title}</h2>
                            <p className="text-gray-600">{step.desc}</p>
                        </div>

                        {index !== steps.length - 1 && (
                            <FaArrowRight size={30} className="text-gray-400 hidden md:block" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default HowItWorks
