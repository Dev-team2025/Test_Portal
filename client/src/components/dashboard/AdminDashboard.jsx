import React from "react";
import userIcon from "../images/users.png";
import reportIcon from "../images/report.png";
import settingsIcon from "../images/top.png";

export default function AdminDashboard() {
    const cards = [
        {
            title: "User Management",
            description: "Manage users, roles, and permissions.",
            image: userIcon,
            link: "/admin/users"
        },
        {
            title: "Report Generation",
            description: "Generate reports by college name or department name.",
            image: reportIcon,
            link: "/admin/reports"
        },
        {
            title: "Questions Management",
            description: "Add, edit, or upload questions and manage quiz settings.",
            image: settingsIcon,
            link: "/admin/settings" // Keep this as is
        }
    ];

    return (
        <div className="p-10 max-w-screen-lg mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="rounded-2xl shadow-lg p-6 w-72 flex flex-col items-center text-center transition duration-300 
                            bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 cursor-pointer"
                    >
                        <img
                            src={card.image}
                            alt={card.title}
                            className="w-32 h-32 object-cover rounded-lg mb-4"
                        />
                        <h2 className="text-xl font-bold mb-2">{card.title}</h2>
                        <p className="text-gray-900">{card.description}</p>
                        <a
                            href={card.link}
                            className="mt-4 px-4 py-2 text-white bg-red-800 rounded-lg hover:bg-green-600"
                        >
                            {card.title}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
