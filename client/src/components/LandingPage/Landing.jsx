import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Button } from "@/components/ui/button"; // Ensure ShadCN UI is properly installed
import image from "../images/hero.jfif";


function Landing() {
    const navigate = useNavigate(); // Initialize navigation

    return (
        <>
            <div className="flex justify-center items-center mt-10 px-4">
                <h1 className="text-3xl md:text-4xl text-red-800 text-center font-bold">
                    Practice Weekly, Perform Better.
                </h1>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-6 px-4 md:px-10">
                <img
                    src={image}
                    className="w-full md:w-[550px] rounded-[30px] md:ml-20 "
                    alt="Hero Image"
                />
                <div className="mt-6 md:mt-0 md:max-w-[500px] text-gray-700">
                    <p className="text-lg"> Placement preparation plays a vital role in securing career opportunities. Practice tests improve your familiarity with question patterns, boost time management, and help identify areas of strength and improvement. This focused approach reduces stress and enhances performance. </p> <p className="text-lg mt-4"> Just one hour of daily problem-solving sharpens your logical and analytical thinking. It encourages deeper engagement with challenges, builds creativity, and strengthens problem-solving skills—essential for academic and career growth. </p> <p className="text-lg mt-4"> Self-driven learning builds discipline, resilience, and adaptability. It connects theory to practical use, enhances placement readiness, and nurtures a mindset of continuous improvement—setting you apart in a competitive world. </p>
                    <div className="mt-4">
                        <Button
                            className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-700"
                            onClick={() => navigate("/dashboard")} // Add onClick function
                        >
                            Start Test Now
                        </Button>
                    </div>
                </div>
            </div>

        </>
    );
}

export default Landing;