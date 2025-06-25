import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import logo from "../../components/images/logo.png";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("username");

        setIsLoggedIn(!!token);
        setUsername(user || "");

        if (token) {
            try {
                const decoded = jwtDecode(token);
                setIsAdmin(decoded.userType === "admin");
                // Store userId for quiz component
                localStorage.setItem("userId", decoded.userId);

                // If admin is on quiz page, redirect to admin dashboard
                if (decoded.userType === "admin" && location.pathname.includes("/dashboard/quiz")) {
                    navigate("/admin");
                }
            } catch (err) {
                console.error("Invalid token");
                handleLogout();
            }
        }
    }, [location, navigate]);

    const handleLogout = () => {
        // Clear all auth-related data
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");

        setIsLoggedIn(false);
        setUsername("");
        setIsAdmin(false);

        Swal.fire({
            title: "Logged Out",
            text: "You have been successfully logged out.",
            icon: "success",
            confirmButtonText: "OK",
        }).then(() => {
            navigate("/");
        });
    };

    return (
        <>
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/">
                                <img className="h-10 w-auto" src={logo} alt="Logo" />
                            </Link>
                        </div>

                        {/* Navigation links */}
                        <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                            <Link
                                to="/"
                                className={`${location.pathname === "/" ? "border-red-800 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                            >
                                Home
                            </Link>

                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className={`${location.pathname.startsWith("/admin") ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Admin Dashboard
                                </Link>
                            )}

                            {isLoggedIn ? (
                                <>
                                    {!isAdmin && (
                                        <Link
                                            to="/dashboard"
                                            className={`${location.pathname === "/dashboard" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                        >
                                            Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-gray-700 px-1 pt-1 border-b-2 border-transparent text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className={`${location.pathname === "/login" ? "border-red-800 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* User status bar */}
            {isLoggedIn && (
                <div className="py-2 px-4 border-b">
                    <div className="max-w-7xl mx-auto text-sm">
                        Logged in as <span className="font-medium">{username}</span>
                        {isAdmin && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                Admin
                            </span>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;