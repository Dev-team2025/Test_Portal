import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEdit, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:5000/api/auth/users", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log("Fetched users response:", response.data);

                const usersArray = Array.isArray(response.data.users) ? response.data.users : [];
                setUsers(usersArray);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError(err.response?.data?.message || "Failed to fetch users");
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [token, navigate]);

    const handleDelete = async (id) => {
        const confirmDelete = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (!confirmDelete.isConfirmed) return;

        try {
            setActionLoading(true);
            await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(user => user._id !== id));
            Swal.fire("Deleted!", "User has been deleted.", "success");
        } catch (err) {
            console.error("Failed to delete user:", err);
            Swal.fire("Error!", err.response?.data?.message || "Failed to delete user", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/users/edit/${id}`);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
            await Swal.fire({
                title: 'Invalid File',
                text: 'Please upload an Excel file (.xlsx, .xls, .csv)',
                icon: 'error'
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheet = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheet];
                const usersFromExcel = XLSX.utils.sheet_to_json(worksheet);

                // Basic validation
                if (usersFromExcel.length === 0) {
                    await Swal.fire({
                        title: 'Empty File',
                        text: 'The uploaded file contains no data',
                        icon: 'warning'
                    });
                    return;
                }

                // Confirm upload with user
                const { isConfirmed } = await Swal.fire({
                    title: 'Confirm Upload',
                    html: `You are about to upload <strong>${usersFromExcel.length}</strong> users.<br><br>
                    <strong>Please verify:</strong><br>
                    - All required fields are present<br>
                    - Email formats are valid<br>
                    - USN formats are correct (e.g., 1RV20CS001)<br>
                    - Branch values are valid (MCA, BCA, BSC, ENGINEERING)<br>
                    - Year of Passing is between 2000-${new Date().getFullYear() + 5}`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33'
                });

                if (!isConfirmed) return;

                setActionLoading(true);
                const response = await axios.post(
                    "http://localhost:5000/api/auth/users/bulk",
                    { users: usersFromExcel },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.success) {
                    let successHtml = `
                    <div style="text-align: left;">
                        <p>Successfully uploaded <strong>${response.data.insertedCount}</strong> users.</p>
                `;

                    if (response.data.skippedCount > 0) {
                        successHtml += `
                        <p>Skipped <strong>${response.data.skippedCount}</strong> users due to:</p>
                        <ul>
                            ${response.data.errors ?
                                response.data.errors.map(err =>
                                    `<li>Row ${err.row}: ${err.message}</li>`
                                ).join('') :
                                '<li>Existing records in system</li>'
                            }
                        </ul>
                    `;
                    }

                    successHtml += `</div>`;

                    await Swal.fire({
                        title: 'Success',
                        html: successHtml,
                        icon: 'success'
                    });

                    // Refresh users list
                    const refreshResponse = await axios.get(
                        "http://localhost:5000/api/auth/users",
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setUsers(refreshResponse.data.users);
                } else {
                    let errorHtml = `
                    <div style="text-align: left; max-height: 300px; overflow-y: auto;">
                        <p>${response.data.message}</p>
                `;

                    if (response.data.errors) {
                        errorHtml += `
                        <p>Found ${response.data.errors.length} errors:</p>
                        <ul>
                            ${response.data.errors.map(err =>
                            `<li>Row ${err.row}: ${err.message || err.errors.join(', ')}</li>`
                        ).join('')}
                        </ul>
                    `;
                    }

                    errorHtml += `</div>`;

                    await Swal.fire({
                        title: 'Upload Failed',
                        html: errorHtml,
                        icon: 'error'
                    });
                }
            } catch (error) {
                console.error("Upload error:", error);
                let errorMessage = error.response?.data?.message || 'Failed to process the file';

                if (error.response?.data?.errors) {
                    errorMessage += '\n\n' +
                        error.response.data.errors.map(err =>
                            `Row ${err.row}: ${err.message}`
                        ).join('\n');
                }

                await Swal.fire({
                    title: 'Error',
                    text: errorMessage,
                    icon: 'error'
                });
            } finally {
                setActionLoading(false);
                event.target.value = ''; // Reset file input
            }
        };
        reader.readAsArrayBuffer(file);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 max-w-screen-lg mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 max-w-screen-lg mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">Users Management</h1>

            <div className="mb-6 flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <FaUpload className="text-blue-600" />
                    <span className="text-blue-600 font-semibold">Upload Excel</span>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
                </label>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Full Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">College</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">USN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{user.fullname}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.college || user.branch}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.usn}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${user.user_type === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.user_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {/* <button
                                            onClick={() => handleEdit(user._id)}
                                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                                            title="Edit"
                                            disabled={actionLoading}
                                        >
                                            <FaEdit />
                                        </button> */}
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete"
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? (
                                                <span className="inline-block h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin "></span>
                                            ) : (
                                                <FaTrash />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UsersManagement;
