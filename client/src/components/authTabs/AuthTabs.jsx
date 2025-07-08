import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
    Mail, Lock, User, KeyRound, GraduationCap,
    ShieldCheck, UserCircle2, AlertCircle, Loader2,
    Upload, Download, FileText, X, Check
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
    const [bulkUsers, setBulkUsers] = useState([]);
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkErrors, setBulkErrors] = useState([]);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Validate email format
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validate USN format (example: 1RV20CS001)
    const validateUSN = (usn) => /^[1-9][A-Za-z]{2}\d{2}[A-Za-z]{2}\d{3}$/i.test(usn);

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
            setError(`Please enter a valid Year of Passing (2000-${new Date().getFullYear() + 5}).`);
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
                yop: parseInt(formData.yop),
                usn: formData.usn.toUpperCase(),
                branch: formData.branch.toUpperCase()
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

    const handleBulkFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setBulkFile(file);
        setBulkErrors([]);

        // Read the file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const users = JSON.parse(content).users;

                if (!Array.isArray(users)) {
                    throw new Error("File must contain a 'users' array");
                }

                setBulkUsers(users);
            } catch (err) {
                setBulkErrors([{
                    message: "Invalid file format. Please upload a valid JSON file with a 'users' array.",
                    type: "file"
                }]);
                setBulkUsers([]);
            }
        };
        reader.readAsText(file);
    };

    const validateBulkUsers = () => {
        const errors = [];
        const currentYear = new Date().getFullYear();
        const validBranches = ['MCA', 'BCA', 'BSC', 'ENGINEERING'];

        bulkUsers.forEach((user, index) => {
            const rowErrors = [];

            // Check required fields
            const requiredFields = ['email', 'password', 'username', 'fullname', 'usn', 'branch', 'yop', 'collegename'];
            const missingFields = requiredFields.filter(field => !user[field]);
            if (missingFields.length > 0) {
                rowErrors.push(`Missing fields: ${missingFields.join(', ')}`);
            }

            // Validate email
            if (user.email && !validateEmail(user.email)) {
                rowErrors.push("Invalid email format");
            }

            // Validate USN
            if (user.usn && !validateUSN(user.usn)) {
                rowErrors.push("Invalid USN format (e.g., 1RV20CS001)");
            }

            // Validate branch
            if (user.branch && !validBranches.includes(user.branch.toUpperCase())) {
                rowErrors.push(`Invalid branch. Must be one of: ${validBranches.join(', ')}`);
            }

            // Validate YOP
            if (user.yop && (isNaN(user.yop) || user.yop < 2000 || user.yop > currentYear + 5)) {
                rowErrors.push(`Invalid YOP (2000-${currentYear + 5})`);
            }

            // Validate password
            if (user.password && user.password.length < 6) {
                rowErrors.push("Password must be at least 6 characters");
            }

            if (rowErrors.length > 0) {
                errors.push({
                    row: index + 1,
                    errors: rowErrors,
                    data: user
                });
            }
        });

        setBulkErrors(errors);
        return errors.length === 0;
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        setError("");

        if (!bulkFile) {
            setError("Please select a file first");
            return;
        }

        if (!validateBulkUsers()) {
            setError("Validation errors found in the uploaded data. Please fix them before uploading.");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/auth/users/bulk",
                { users: bulkUsers },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setError("");
                setBulkFile(null);
                setBulkUsers([]);
                setBulkErrors([]);
                alert(`Successfully uploaded ${response.data.insertedCount} users`);
            } else {
                setError(response.data.message || "Bulk upload failed. Please check your data.");
            }
        } catch (err) {
            console.error("Bulk upload error:", err);
            setError(err.response?.data?.message || "An unexpected error occurred during bulk upload.");

            if (err.response?.data?.errors) {
                setBulkErrors(err.response.data.errors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = {
            users: [
                {
                    email: "student1@example.com",
                    password: "password123",
                    username: "student1",
                    fullname: "Student One",
                    usn: "1RV20CS001",
                    branch: "MCA",
                    yop: 2023,
                    collegename: "RV College of Engineering"
                },
                {
                    email: "student2@example.com",
                    password: "password123",
                    username: "student2",
                    fullname: "Student Two",
                    usn: "1RV20CS002",
                    branch: "BCA",
                    yop: 2024,
                    collegename: "RV College of Engineering"
                }
            ]
        };

        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users_template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                    onClick={() => {
                        setActiveTab("login");
                        setShowBulkUpload(false);
                    }}
                    className={`px-5 py-2 rounded-lg font-semibold transition duration-300 ${activeTab === "login" ? "bg-red-800 text-white" : "bg-white text-black"
                        }`}
                >
                    Login
                </button>
                <button
                    onClick={() => {
                        setActiveTab("signup");
                        setShowBulkUpload(false);
                    }}
                    className={`px-5 py-2 rounded-lg font-semibold transition duration-300 ${activeTab === "signup" ? "bg-red-800 text-white" : "bg-white text-black"
                        }`}
                >
                    Sign Up
                </button>
                {localStorage.getItem("user_type") === "admin" && (
                    <button
                        onClick={() => {
                            setShowBulkUpload(!showBulkUpload);
                            setActiveTab("");
                        }}
                        className={`px-5 py-2 rounded-lg font-semibold transition duration-300 ${showBulkUpload ? "bg-red-800 text-white" : "bg-white text-black"
                            }`}
                    >
                        Bulk Upload
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-900/50 rounded-lg">
                    <AlertCircle className="text-red-300" />
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {showBulkUpload ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Bulk User Upload</h3>
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Download size={16} />
                            Download Template
                        </button>
                    </div>

                    <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center">
                        <label className="cursor-pointer flex flex-col items-center">
                            <Upload className="h-10 w-10 mb-2" />
                            <span className="font-medium">Click to upload or drag and drop</span>
                            <span className="text-sm text-white/70">JSON file only</span>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleBulkFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {bulkFile && (
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText />
                                <span>{bulkFile.name}</span>
                            </div>
                            <button onClick={() => setBulkFile(null)}>
                                <X className="text-red-500" />
                            </button>
                        </div>
                    )}

                    {bulkErrors.length > 0 && (
                        <div className="bg-red-900/30 rounded-lg p-4">
                            <h4 className="font-bold mb-2">Validation Errors ({bulkErrors.length})</h4>
                            <div className="max-h-60 overflow-y-auto">
                                {bulkErrors.map((error, i) => (
                                    <div key={i} className="mb-3 p-2 bg-red-900/50 rounded">
                                        <div className="font-semibold">Row {error.row}:</div>
                                        <ul className="list-disc list-inside">
                                            {error.errors.map((err, j) => (
                                                <li key={j}>{err}</li>
                                            ))}
                                        </ul>
                                        {error.data && (
                                            <div className="mt-1 text-sm opacity-80">
                                                Data: {JSON.stringify(error.data)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {bulkUsers.length > 0 && (
                        <div className="bg-green-900/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Check className="text-green-400" />
                                <span>Ready to upload {bulkUsers.length} users</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {bulkUsers.slice(0, 5).map((user, i) => (
                                    <div key={i} className="mb-2 p-2 bg-white/10 rounded text-sm">
                                        {user.email} - {user.usn}
                                    </div>
                                ))}
                                {bulkUsers.length > 5 && (
                                    <div className="text-center text-sm opacity-70">
                                        + {bulkUsers.length - 5} more users
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleBulkUpload}
                        disabled={!bulkFile || bulkErrors.length > 0 || isLoading}
                        className="w-full p-3 bg-red-800 text-white rounded-xl font-bold transition hover:bg-red-700 disabled:opacity-50"
                    >
                        {isLoading ? "Uploading..." : "Upload Users"}
                    </button>
                </div>
            ) : activeTab === "login" ? (
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
                    <div className="flex items-center gap-2 border-b-2 border-b-red-800 bg-white rounded-xl p-2">
                        <GraduationCap className="text-gray-500" />
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