import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Sweeticons2 (Lucide)
import {
    Mail, Lock, User, KeyRound, GraduationCap,
    ShieldCheck, UserCircle2
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
    const navigate = useNavigate();

    const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setError("Please enter a valid email.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/login", { email, password });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userId", response.data.userId);
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("email", response.data.email);
            localStorage.setItem("userType", response.data.userType);

            navigate(response.data.userType === 'admin' ? "/admindashboard" : "/dashboard");
        } catch (err) {
            setError("❌ Invalid credentials or user not found.");
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setError("Please enter a valid email.");
            return;
        }
        if (!username || !fullname || !usn || !branch || !yop) {
            setError("All fields are required.");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/register", {
                username, fullname, usn, branch, yop, email, password
            });
            setError("");
            setActiveTab("login");
        } catch (err) {
            setError("❌ Registration failed. User may already exist.");
        }
    };

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

            {error && <p className="text-red-400 text-center mb-4">{error}</p>}

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
                        />
                    </div>
                    <button className="w-full p-3 bg-red-800 text-white rounded-xl font-bold transition">
                        Login
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
                        />
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <ShieldCheck className="text-gray-500" />
                        <select
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="w-full bg-transparent p-2 text-black focus:outline-none"
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
                        />
                    </div>
                    <button className="w-full p-3 bg-red-800 text-white rounded-xl font-bold transition">
                        Sign Up
                    </button>
                </form>
            )}
        </div>
    );
}
