import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../components/images/logo.png";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("username");
        setIsLoggedIn(!!token);
        setUsername(user || "");
    }, [location]);

    const handleLogout = () => {
        // Clear authentication-related data
        localStorage.removeItem("token");
        localStorage.removeItem("username");

        setIsLoggedIn(false);
        setUsername("");

        // Show SweetAlert2 logout success message
        Swal.fire({
            title: "Logged out successfully!",
            text: "See you again soon!",
            icon: "success",
            confirmButtonColor: "#d33",
            confirmButtonText: "OK",
        }).then(() => {
            navigate("/");
        });
    };

    return (
        <>
            <nav className="flex flex-wrap items-center justify-between px-4 py-4 bg-white shadow-md">
                <Link to="/" className="flex-shrink-0">
                    <img src={logo} alt="Logo" className="h-16 w-auto max-w-full object-contain" />
                </Link>

                <ul className="flex flex-wrap gap-6 mt-4 md:mt-0 md:flex-nowrap md:gap-8">
                    {["Home", "Features", "Dashboard"].map((item) => {
                        const path = item === "Home" ? "/" : `/${item.toLowerCase()}`;
                        const isActive = location.pathname === path;

                        return (
                            <li key={item} className="w-full md:w-auto text-center">
                                <Link to={path} className={`no-underline ${isActive ? "text-red-800 font-bold" : "text-black hover:text-red-800"}`}>
                                    {item}
                                </Link>
                            </li>
                        );
                    })}

                    <li className="w-full md:w-auto text-center">
                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="no-underline text-black hover:text-red-800 cursor-pointer bg-transparent border-none">
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className={`no-underline ${location.pathname === "/login" ? "text-red-800 font-bold" : "text-black hover:text-red-800"}`}>
                                Login
                            </Link>
                        )}
                    </li>
                </ul>
            </nav>

            {isLoggedIn && (
                <div className="bg-gray-100 py-2 px-4 text-sm text-center">
                    You are logged in as <span className="font-semibold">{username}</span>
                </div>
            )}
        </>
    );
}

export default Navbar;
