import React from 'react';
import { FaClipboardList, FaBolt, FaChartBar } from 'react-icons/fa';

function Features() {
    const features = [
        {
            icon: <FaClipboardList size={50} className="text-blue-600" />,
            title: 'Weekly Practice Tests',
            desc: 'Attempt weekly tests anytime and improve your skills.',
        },
        {
            icon: <FaBolt size={50} className="text-green-600" />,
            title: 'Instant Results & Feedback',
            desc: 'Get scores instantly after submission with detailed feedback.',
        },
        {
            icon: <FaChartBar size={50} className="text-purple-600" />,
            title: 'Dashboard',
            desc: 'Generate test reports, track progress & export to Excel.',
        },
    ];

    return (
        <div className="py-5 px-4">
            <h1 className="text-3xl text-red-800 text-center font-bold mb-8">
                Features
            </h1>

            <div className="flex flex-wrap justify-center gap-10">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="w-90 p-10 bg-white shadow-lg rounded-2xl text-center hover:scale-105 transition-all duration-300"
                    >
                        <div className="mb-4 flex justify-center">{feature.icon}</div>
                        <h2 className="text-xl font-bold mb-2">{feature.title}</h2>
                        <p className="text-gray-600">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Features;