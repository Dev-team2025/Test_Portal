import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import logo from "../../components/images/logo.png";
import {
    UserCircle,
    Home,
    LayoutDashboard,
    LogOut,
    LogIn,
    Shield,
    Menu,
    X
} from "lucide-react";
import { motion } from "framer-motion";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decoded = jwtDecode(token);
                setIsLoggedIn(true);
                setEmail(decoded.email);
                setUsername(decoded.name || decoded.email.split('@')[0]);
                setIsAdmin(decoded.user_type === "admin");

                localStorage.setItem("userId", decoded._id);

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
        setProfileDropdownOpen(false);

        Swal.fire({
            title: "Logged Out",
            text: "You have been successfully logged out.",
            icon: "success",
            confirmButtonText: "OK",
        }).then(() => {
            navigate("/");
        });
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleProfileDropdown = () => {
        setProfileDropdownOpen(!profileDropdownOpen);
    };

    const navLinks = [
        { path: "/", name: "Home", icon: <Home /> },
        ...(isAdmin ? [{ path: "/admindashboard", name: "Admin Dashboard", icon: <Shield /> }] : []),
        ...(isLoggedIn && !isAdmin ? [{ path: "/dashboard", name: "Dashboard", icon: <LayoutDashboard /> }] : [])
    ];

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/">
                            <img className="h-10 w-auto" src={logo} alt="Logo" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-4">
                        <div className="flex space-x-8">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    active={location.pathname === link.path}
                                >
                                    <span className="flex items-center space-x-2 group">
                                        <span className="group-hover:text-indigo-600 transition-colors duration-200">
                                            {React.cloneElement(link.icon, {
                                                className: "h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                                            })}
                                        </span>
                                        <span>{link.name}</span>
                                    </span>
                                </NavLink>
                            ))}
                        </div>

                        {/* User actions */}
                        <div className="ml-4 flex items-center">
                            {isLoggedIn ? (
                                <div className="relative">
                                    <button
                                        onClick={toggleProfileDropdown}
                                        className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        id="user-menu"
                                        aria-expanded="false"
                                        aria-haspopup="true"
                                    >
                                        <UserCircle className="h-8 w-8 text-gray-500 hover:text-indigo-600 transition-transform duration-200 hover:scale-110" />
                                        <div className="text-left">
                                            <div className="font-medium text-gray-700">{username}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[120px]">{email}</div>
                                        </div>
                                    </button>

                                    {profileDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                            role="menu"
                                            aria-orientation="vertical"
                                            aria-labelledby="user-menu"
                                        >
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <div className="font-medium text-gray-900">{username}</div>
                                                <div className="text-xs text-gray-500 truncate">{email}</div>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                role="menuitem"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Sign out
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="sm:hidden"
                >
                    <div className="pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`${location.pathname === link.path
                                        ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                                    } border-l-4 block pl-3 pr-4 py-2 text-base font-medium`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="flex items-center space-x-3 group">
                                    <span className="text-gray-500 group-hover:text-indigo-600 transition">
                                        {React.cloneElement(link.icon, { className: "h-5 w-5" })}
                                    </span>
                                    <span>{link.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {isLoggedIn ? (
                            <>
                                <div className="flex items-center px-4">
                                    <UserCircle className="h-10 w-10 text-gray-500" />
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800">{username}</div>
                                        <div className="text-sm font-medium text-gray-500">{email}</div>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    >
                                        <LogOut className="h-5 w-5 mr-3" />
                                        Sign out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <LogIn className="h-5 w-5 mr-3" />
                                Login
                            </Link>
                        )}
                    </div>
                </motion.div>
            )}
        </nav>
    );
}

function NavLink({ to, active, children, ...props }) {
    return (
        <Link
            to={to}
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${active
                    ? "border-indigo-500 text-indigo-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
            {...props}
        >
            {children}
        </Link>
    );
}

export default Navbar;
