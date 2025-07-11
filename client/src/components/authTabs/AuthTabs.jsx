import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
    Mail, Lock, User, KeyRound, GraduationCap,
    ShieldCheck, UserCircle2, AlertCircle, Loader2, School
} from "lucide-react";

export default function AuthTabs() {
    const [activeTab, setActiveTab] = useState("login");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        fullname: "",
        usn: "",
        branch: "",
        yop: "",
        collegename: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Validate email format
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validate USN format (example: 1RV20CS001)
    const validateUSN = (usn) => /^[1-9][A-Za-z]{2}\d{2}[A-Za-z]{2}\d{3}$/.test(usn);

    // Validate Year of Passing (between 2000 and current year + 5)
    const validateYOP = (yop) => {
        const currentYear = new Date().getFullYear();
        return yop >= 2000 && yop <= currentYear + 5;
    };

    // Verify token on component mount
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");

            const user_type = localStorage.getItem("user_type");
            if (!token) return;

            setIsLoading(true);
            try {
                const response = await axios.get("http://localhost:5000/api/auth/verify-token", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const decoded = jwtDecode(token);
                    if (decoded.user_type === "admin") {
                        navigate("/admindashboard");
                    } else {
                        navigate("/dashboard");
                    }
                }
            } catch (err) {
                console.error("Token verification failed:", err);
                localStorage.removeItem("token");
                setError("Your session has expired. Please login again.");
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, [navigate]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email: formData.email,
                password: formData.password
            }, {
                validateStatus: (status) => status < 500
            });

            if (response.data.success) {
                const token = response.data.token;
                localStorage.setItem("token", token);

                const decoded = jwtDecode(token);
                localStorage.setItem("user_id", decoded._id);
                localStorage.setItem("user_type", decoded.user_type);

                navigate(decoded.user_type === 'admin' ? "/admindashboard" : "/dashboard");
            } else {
                setError(response.data.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "An unexpected error occurred during login.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        // Validate all fields
        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (!validateUSN(formData.usn)) {
            setError("Please enter a valid USN (e.g., 1RV20CS001).");
            return;
        }

        if (!validateYOP(parseInt(formData.yop))) {
            setError("Please enter a valid Year of Passing (2000-current year + 5).");
            return;
        }

        if (!formData.username || !formData.fullname || !formData.branch || !formData.collegename) {
            setError("All fields are required.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/auth/register", {
                ...formData,
                yop: parseInt(formData.yop)
            }, {
                validateStatus: (status) => status < 500
            });

            if (response.data.success) {
                setError("");
                setActiveTab("login");
                // Clear form fields
                setFormData({
                    email: "",
                    password: "",
                    username: "",
                    fullname: "",
                    usn: "",
                    branch: "",
                    yop: "",
                    collegename: ""
                });
            } else {
                setError(response.data.message || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "An unexpected error occurred during registration.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-12 w-12 text-red-800" />
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-2xl shadow-lg font-['Roboto']">
            <div className="flex justify-center gap-6 mb-6 p-3 rounded-xl bg-white/10 backdrop-blur-md shadow-md">
                <button
                    onClick={() => setActiveTab("login")}
                    className={`px-5 py-2 rounded-lg font-semibold transition duration-300 ${activeTab === "login" ? "bg-red-800 text-white" : "bg-white text-black"
                        }`}
                >
                    Login
                </button>
                {/* <button
                    onClick={() => setActiveTab("signup")}
                    className={`px-5 py-2 rounded-lg font-semibold transition duration-300 ${activeTab === "signup" ? "bg-red-800 text-white" : "bg-white text-black"
                        }`}
                >
                    Sign Up
                </button> */}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-900/50 rounded-lg">
                    <AlertCircle className="text-red-300" />
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {activeTab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <Mail className="text-gray-500" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <Lock className="text-gray-500" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                            minLength="6"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 bg-red-800 text-white rounded-xl font-bold transition hover:bg-red-700 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                            <UserCircle2 className="text-gray-500" />
                            <input
                                type="text"
                                name="fullname"
                                placeholder="Full Name"
                                value={formData.fullname}
                                onChange={handleInputChange}
                                className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                            <KeyRound className="text-gray-500" />
                            <input
                                type="text"
                                name="usn"
                                placeholder="USN (e.g., 1RV20CS001)"
                                value={formData.usn}
                                onChange={handleInputChange}
                                className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                            <ShieldCheck className="text-gray-500" />
                            <select
                                name="branch"
                                value={formData.branch}
                                onChange={handleInputChange}
                                className="w-full bg-transparent p-2 text-black focus:outline-none"
                                required
                            >
                                <option value="">Select Branch</option>
                                <option value="MCA">MCA</option>
                                <option value="BSC">BSC</option>
                                <option value="BCA">BCA</option>
                                <option value="ENGINEERING">ENGINEERING</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                            <GraduationCap className="text-gray-500" />
                            <input
                                type="number"
                                name="yop"
                                placeholder="Year of Passing"
                                value={formData.yop}
                                onChange={handleInputChange}
                                className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                                required
                                min="2000"
                                max={new Date().getFullYear() + 5}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <School className="text-gray-500" />
                        <input
                            type="text"
                            name="collegename"
                            placeholder="College Name"
                            value={formData.collegename}
                            onChange={handleInputChange}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <User className="text-gray-500" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <Mail className="text-gray-500" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <Lock className="text-gray-500" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password (min 6 characters)"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                            minLength="6"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 bg-red-800 text-white rounded-xl font-bold transition hover:bg-red-700 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? "Registering..." : "Sign Up"}
                    </button>
                </form>
            )}
        </div>
    );
}