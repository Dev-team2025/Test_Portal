import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../components/images/logo.png';

function Navbar({ isLoggedIn }) {
    const location = useLocation();

    return (
        <nav className="flex flex-wrap items-center justify-between px-4 py-4 bg-white shadow-md">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
                <img
                    src={logo}
                    alt="Logo"
                    className="h-16 w-auto max-w-full object-contain"
                />
            </Link>

            {/* Navigation Links */}
            <ul className="flex flex-wrap gap-6 mt-4 md:mt-0 md:flex-nowrap md:gap-8">
                {["Home", "Features", "Dashboard"].map((item) => {
                    const path = item === "Home" ? "/" : `/${item.toLowerCase()}`;
                    const isActive = location.pathname === path;

                    return (
                        <li key={item} className="w-full md:w-auto text-center">
                            <Link
                                to={path}
                                className={`no-underline ${isActive
                                    ? "text-red-800 font-bold"
                                    : "text-black hover:text-red-800"
                                    }`}
                            >
                                {item}
                            </Link>
                        </li>
                    );
                })}
                {/* Login/Logout Link */}
                <li className="w-full md:w-auto text-center">
                    <Link
                        to={isLoggedIn ? "/logout" : "/login"}
                        className={`no-underline ${location.pathname === (isLoggedIn ? "/logout" : "/login")
                            ? "text-red-800 font-bold"
                            : "text-black hover:text-red-800"
                            }`}
                    >
                        {isLoggedIn ? "Logout" : "Login"}
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;