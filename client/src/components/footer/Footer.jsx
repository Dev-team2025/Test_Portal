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
                                <li><Link to="/dashboard/quiz">Quiz</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                            <p>Email: info@dlithe.com</p>
                            <p>Phone: +91-9008815252</p>
                            <p>Location: No. 280. 3rd Floor SLV ARCADE. 100 Feet Ring Road, BSK 3rd Stage, Bangalore-560070</p>
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

                {/* Map Embed */}
                <div className="mt-10 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.7294940371207!2d77.54736780860529!3d12.92509971584759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3fdfd6391453%3A0x4662827b839e02e8!2sDLithe%20Consultancy%20Services%20Pvt%20Ltd!5e0!3m2!1sen!2sus!4v1752063482209!5m2!1sen!2sus" width="100%" height="450" style={{ "border:0;": "border:0" }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
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
