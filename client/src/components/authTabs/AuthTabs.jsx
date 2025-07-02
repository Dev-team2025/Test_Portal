import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Icons
import {
    Mail, Lock, User, KeyRound, GraduationCap,
    ShieldCheck, UserCircle2, AlertCircle
} from "lucide-react";

export default function AuthTabs() {
    const [activeTab, setActiveTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [usn, setUsn] = useState("");
    const [fullname, setFullname] = useState("");
    const [branch, setBranch] = useState("");
    const [yop, setYop] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);

    // Verify token on component mount
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            setIsLoading(true);
            try {
                const response = await axios.get("http://localhost:5000/api/verify-token", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const decoded = jwtDecode(token);
                    navigate(decoded.userType === 'admin' ? "/admindashboard" : "/dashboard");
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

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/login", {
                email, password
            }, {
                validateStatus: (status) => status < 500
            });

            if (response.data.success) {
                const token = response.data.token;
                localStorage.setItem("token", token);

                try {
                    const decoded = jwtDecode(token);
                    if (!decoded.id || !decoded.email) {
                        throw new Error("Invalid token payload");
                    }

                    navigate(decoded.userType === 'admin' ? "/admindashboard" : "/dashboard");
                } catch (decodeErr) {
                    console.error("Token decode error:", decodeErr);
                    setError("Invalid authentication token received");
                    localStorage.removeItem("token");
                }
            } else {
                setError(response.data.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "❌ Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!username || !fullname || !usn || !branch || !yop) {
            setError("All fields are required.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/register", {
                username, fullname, usn, branch, yop, email, password
            }, {
                validateStatus: (status) => status < 500
            });

            if (response.data.success) {
                setError("");
                setActiveTab("login");
                // Clear form fields
                setUsername("");
                setFullname("");
                setUsn("");
                setBranch("");
                setYop("");
                setEmail("");
                setPassword("");
            } else {
                setError(response.data.message || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "❌ Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-800"></div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-2xl shadow-lg font-['Roboto']">
            <div className="flex justify-center gap-6 mb-6 p-3 rounded-xl bg-white/10 backdrop-blur-md shadow-md">
                <button
                    onClick={() => setActiveTab("login")}
                    className={`px-5 py-2 rounded-lg font-semibold transition duration-300 ${activeTab === "login"
                        ? "bg-red-800 text-white"
                        : "bg-white text-black"
                        }`}
                >
                    Login
                </button>
                <button
                    onClick={() => setActiveTab("signup")}
                    className={`px-5 py-2 rounded-lg font-semibold transition duration-300 ${activeTab === "signup"
                        ? "bg-red-800 text-white"
                        : "bg-white text-black"
                        }`}
                >
                    Sign Up
                </button>
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
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <Lock className="text-gray-500" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <UserCircle2 className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <KeyRound className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="USN"
                            value={usn}
                            onChange={(e) => setUsn(e.target.value)}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <ShieldCheck className="text-gray-500" />
                        <select
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
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
                            type="text"
                            placeholder="Year of Passing (YOP)"
                            value={yop}
                            onChange={(e) => setYop(e.target.value)}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <User className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <Mail className="text-gray-500" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent p-2 text-black placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <Lock className="text-gray-500" />
                        <input
                            type="password"
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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