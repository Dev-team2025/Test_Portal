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
                    className="w-full md:w-[450px] rounded-[30px] md:ml-20"
                    alt="Hero Image"
                />
                <div className="mt-6 md:mt-0 md:max-w-[500px] text-gray-700">
                    <p className="text-lg">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, impedit aperiam corrupti quo earum ipsam!
                        Fugit tenetur cumque eligendi quibusdam perferendis provident sequi exercitationem nisi, aliquid earum et!
                        Alias, tempora.
                        <br /><br />
                        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nobis provident voluptate nostrum harum tempora debitis quasi reprehenderit qui, sunt laborum! Amet mollitia nesciunt sint fugit quia, natus voluptatem voluptatum similique.
                        <br /><br />
                        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quas, enim aliquam. Aliquid, modi quo. Beatae alias debitis, in modi enim dignissimos possimus? Provident libero eos nulla alias sed. Maxime, rem!
                    </p>

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