import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import logo from "../../components/images/logo.png";
import { UserCircle } from "lucide-react";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState(""); // New state for email

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("Decoded token:", decoded); // For debugging

                // Extract user information from token
                setIsLoggedIn(true);
                setEmail(decoded.email); // Set email from token
                setUsername(decoded.email.split('@')[0]); // Extract username from email
                setIsAdmin(decoded.user_type === "admin");

                // Store user ID if needed
                localStorage.setItem("userId", decoded._id);

                // Redirect admin if on quiz page
                if (decoded.user_type === "admin" && location.pathname.includes("/dashboard/quiz")) {
                    navigate("/admin");
                }
            } catch (err) {
                console.error("Invalid token:", err);
                handleLogout();
            }
        } else {
            setIsLoggedIn(false);
            setUsername("");
            setEmail("");
            setIsAdmin(false);
        }
    }, [location, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
        setUsername("");
        setEmail("");
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
                        <Link to="/" className="nav-link" active={location.pathname === "/"}>
                            Home
                        </Link>

                        {isAdmin && (
                            <Link to="/admin" className="nav-link" active={location.pathname.startsWith("/admin")}>
                                Admin Dashboard
                            </Link>
                        )}

                        {isLoggedIn ? (
                            <div className="flex items-center space-x-4">
                                {!isAdmin && (
                                    <Link to="/dashboard" className="nav-link" active={location.pathname === "/dashboard"}>
                                        Dashboard
                                    </Link>
                                )}

                                {/* User info with avatar */}
                                <div className="flex items-center space-x-2">
                                    <UserCircle className="h-6 w-6 text-gray-500" />
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-700">
                                            {username} {/* Display extracted username */}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {email} {/* Display email */}
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleLogout} className="logout-button">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="nav-link" active={location.pathname === "/login"}>
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

// Helper components for cleaner code
function NavLink({ to, active, children, ...props }) {
    return (
        <Link
            to={to}
            className={`${active ? "border-red-800 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
            {...props}
        >
            {children}
        </Link>
    );
}

export default Navbar;