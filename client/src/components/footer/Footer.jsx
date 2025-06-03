import React from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-10 mt-10">
            <div className="max-w-6xl mx-auto px-4">
                {/* Box Wrapper */}
                <div className="border border-gray-700 rounded-lg p-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                        {/* Logo & Tagline */}
                        <div>
                            <h2 className="text-2xl font-bold mb-3">SkillTest</h2>
                            <p className="text-gray-300">Empowering Students with Weekly Practice & Progress Tracking.</p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/features">Features</Link></li>
                                <li><Link to="/pricing">Pricing</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                            <p>Email: support@skilltest.com</p>
                            <p>Phone: +91 98765 43210</p>
                            <p>Address: Bangalore, India</p>
                        </div>

                        {/* Social Icons */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
                            <div className="flex gap-4">
                                <FaFacebookF className="hover:text-blue-400 cursor-pointer" />
                                <FaTwitter className="hover:text-blue-400 cursor-pointer" />
                                <FaLinkedinIn className="hover:text-blue-400 cursor-pointer" />
                                <FaInstagram className="hover:text-blue-400 cursor-pointer" />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Line */}
                <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
                    © {new Date().getFullYear()} SkillTest. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;