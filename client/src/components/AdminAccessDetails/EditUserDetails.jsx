import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaArrowLeft } from 'react-icons/fa';

function EditUserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        fullname: '',
        usn: '',
        branch: '',
        yop: '',
        email: '',
        user_type: 'user',
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/auth/users/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then((res) => {
                if (res.data.success) {
                    setFormData(res.data.data);
                }
            })
            .catch((err) => {
                console.error(err);
                Swal.fire("Error", "Failed to fetch user details", "error");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setUpdating(true);

        axios.put(`http://localhost:5000/api/auth/users/${id}`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then((res) => {
                Swal.fire("Updated", "User details updated successfully", "success").then(() => {
                    navigate("/admin/users");
                });
            })
            .catch((err) => {
                console.error(err);
                Swal.fire("Error", "Failed to update user", "error");
            })
            .finally(() => {
                setUpdating(false);
            });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
                <button
                    className="text-blue-600 hover:text-blue-800 mr-2"
                    onClick={() => navigate(-1)}
                    title="Back"
                >
                    <FaArrowLeft />
                </button>
                <h2 className="text-2xl font-bold text-center w-full">Edit User Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {[
                    { label: 'Username', name: 'username', type: 'text' },
                    { label: 'Full Name', name: 'fullname', type: 'text' },
                    { label: 'USN', name: 'usn', type: 'text' },
                    { label: 'Branch', name: 'branch', type: 'text' },
                    { label: 'Year of Passing', name: 'yop', type: 'number' },
                    { label: 'Email', name: 'email', type: 'email' }
                ].map((field) => (
                    <div key={field.name}>
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                        </label>
                        <input
                            id={field.name}
                            type={field.type}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                ))}

                <div>
                    <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                    </label>
                    <select
                        id="user_type"
                        name="user_type"
                        value={formData.user_type}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={updating}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 ${updating ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                >
                    {updating ? (
                        <span className="flex justify-center items-center">
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                ></path>
                            </svg>
                            Updating...
                        </span>
                    ) : (
                        "Update User"
                    )}
                </button>
            </form>
        </div>
    );
}

export default EditUserDetails;
