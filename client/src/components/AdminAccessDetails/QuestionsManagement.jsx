import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function QuestionsManagement() {
    const [questions, setQuestions] = useState([]);
    const [formData, setFormData] = useState({
        set: "",
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correctOption: "",
        explanation: ""
    });

    const fetchQuestions = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/questions");
            setQuestions(res.data);
        } catch (error) {
            console.error("Failed to load questions", error);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleExcelUpload = async () => {
        if (!file) {
            Swal.fire("Error", "Please select an Excel file", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            await axios.post("http://localhost:5000/api/questions/upload-excel", formData);
            Swal.fire("Success", "Questions uploaded from Excel!", "success");
            fetchQuestions();
            setFile(null);
        } catch (err) {
            console.error("Upload Error:", err);
            Swal.fire("Error", "Failed to upload questions", "error");
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        // Trim all input fields before sending
        const trimmedData = {
            set: formData.set.trim(),
            question: formData.question.trim(),
            option_a: formData.option_a.trim(),
            option_b: formData.option_b.trim(),
            option_c: formData.option_c.trim(),
            option_d: formData.option_d.trim(),
            correctOption: formData.correctOption.trim(),
            explanation: formData.explanation.trim()
        };

        try {
            await axios.post("http://localhost:5000/api/questions", trimmedData);
            Swal.fire("Success", "Question added successfully!", "success");
            setFormData({
                set: "",
                question: "",
                option_a: "",
                option_b: "",
                option_c: "",
                option_d: "",
                correctOption: "",
                explanation: ""
            });
            fetchQuestions();
        } catch (error) {
            Swal.fire("Error", "Failed to add question", "error");
            console.error("Add question error:", error.response?.data || error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/questions/${id}`);
            Swal.fire("Deleted", "Question removed!", "success");
            fetchQuestions();
        } catch (error) {
            Swal.fire("Error", "Failed to delete", "error");
        }
    };

    return (
        <div className="p-10 max-w-screen-xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-lg font-semibold mb-2">Bulk Upload via Excel</h2>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="mb-4"
                />
                <button
                    onClick={handleExcelUpload}
                    style={{ backgroundColor: "var(--color-red-800)" }}
                    className="text-white px-4 py-2 rounded hover:opacity-90"
                >
                    Upload Excel
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-6 text-center">Questions Management</h1>

            <form
                onSubmit={handleAdd}
                className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow"
            >
                <input
                    type="text"
                    name="set"
                    placeholder="SET"
                    value={formData.set}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                    required
                />

                {["question", "option_a", "option_b", "option_c", "option_d", "correctOption", "explanation"].map((field) => (
                    <input
                        key={field}
                        type="text"
                        name={field}
                        placeholder={field.replace(/([A-Z])/g, " $1").toUpperCase()}
                        value={formData[field]}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                        required
                    />
                ))}

                <button
                    type="submit"
                    className="col-span-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                    Add Question
                </button>
            </form>

            <div className="grid gap-4">
                {questions.map((q, i) => (
                    <div
                        key={q._id}
                        className="p-4 bg-gray-100 rounded-lg shadow flex justify-between items-center"
                    >
                        <div>
                            <p className="font-semibold">{i + 1}. [{q.set}] {q.question}</p>
                            <ul className="ml-4 text-sm">
                                <li>A. {q.options.a}</li>
                                <li>B. {q.options.b}</li>
                                <li>C. {q.options.c}</li>
                                <li>D. {q.options.d}</li>
                                <li>Correct: {q.correctOption}</li>
                                <li className="text-gray-500">Explanation: {q.explanation}</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => handleDelete(q._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuestionsManagement;
