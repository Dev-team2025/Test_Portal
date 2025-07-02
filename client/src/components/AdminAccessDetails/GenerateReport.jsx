import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function GenerateReport() {
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchBranch, setSearchBranch] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [selectedQuizSet, setSelectedQuizSet] = useState("all"); // "all", "1", "2", "3"

    useEffect(() => {
        axios.get("http://localhost:5000/api/report/user-answers")
            .then(res => {
                setReportData(res.data);
                setFilteredData(res.data);
            })
            .catch(err => console.error("Error fetching report:", err));
    }, []);

    const handleSearch = () => {
        const filtered = reportData.filter(user =>
            user.userDetails.branch.toLowerCase().includes(searchBranch.toLowerCase()) &&
            user.userDetails.email.toLowerCase().includes(searchEmail.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const handleReset = () => {
        setSearchBranch("");
        setSearchEmail("");
        setSelectedQuizSet("all");
        setFilteredData(reportData);
    };

    const filterByQuizSet = (data, quizSet) => {
        if (quizSet === "all") return data;

        // Assuming each answer has a quizSet property (you'll need to add this to your backend)
        return data.map(user => ({
            ...user,
            answers: user.answers.filter(ans => ans.quizSet === quizSet)
        })).filter(user => user.answers.length > 0);
    };

    const handleDownload = () => {
        const dataToExport = selectedQuizSet === "all"
            ? filteredData
            : filterByQuizSet(filteredData, selectedQuizSet);

        if (dataToExport.length === 0) {
            alert("No data available for the selected quiz set");
            return;
        }

        const excelData = dataToExport.map((user) => {
            const base = {
                Name: user.userDetails.fullname,
                USN: user.userDetails.usn,
                Username: user.userDetails.username,
                Branch: user.userDetails.branch,
                YOP: user.userDetails.yop,
                Email: user.userDetails.email,
                College: user.userDetails.college || "N/A",
                "Registered On": user.userDetails.created_at
                    ? new Date(user.userDetails.created_at).toLocaleString()
                    : "N/A",
            };

            user.answers.forEach((ans) => {
                const colHeader =
                    ans.question.length > 100
                        ? ans.question.substring(0, 100) + "..."
                        : ans.question;

                base[colHeader] = ans.selectedOption || "Not Answered";
            });

            return base;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        const fileName = selectedQuizSet === "all"
            ? "AllQuizzesReport.xlsx"
            : `QuizSet${selectedQuizSet}Report.xlsx`;

        XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Report");
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">User Quiz Report</h2>

            <div className="flex gap-4 mb-6 items-center flex-wrap">
                <input
                    type="text"
                    placeholder="Search by Branch (e.g., CSE)"
                    value={searchBranch}
                    onChange={e => setSearchBranch(e.target.value)}
                    className="border px-3 py-2 rounded w-64"
                />
                <input
                    type="text"
                    placeholder="Search by Email"
                    value={searchEmail}
                    onChange={e => setSearchEmail(e.target.value)}
                    className="border px-3 py-2 rounded w-64"
                />
                <select
                    value={selectedQuizSet}
                    onChange={e => setSelectedQuizSet(e.target.value)}
                    className="border px-3 py-2 rounded w-48"
                >
                    <option value="all">All Quiz Sets</option>
                    <option value="1">Monday Test</option>
                    <option value="2">Wednesday Test</option>
                    <option value="3">Friday Test</option>
                </select>
                <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Search
                </button>
                <button
                    onClick={handleReset}
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                    Reset
                </button>
                {filteredData.length > 0 && (
                    <button
                        onClick={handleDownload}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Download Excel
                    </button>
                )}
            </div>

            {filteredData.map((user, index) => (
                <div key={index} className="mb-8 p-4 border rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">
                        {user.userDetails.fullname} ({user.userDetails.username}) <br />
                        USN: {user.userDetails.usn} <br />
                        Branch: {user.userDetails.branch}, YOP: {user.userDetails.yop} <br />
                        Email: {user.userDetails.email} <br />
                        College: {user.userDetails.college || "N/A"} <br />
                        Registered On:{" "}
                        {user.userDetails.created_at
                            ? new Date(user.userDetails.created_at).toLocaleString()
                            : "N/A"}
                    </h3>

                    <table className="w-full table-auto border-collapse border border-gray-300 mt-4">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Quiz Set</th>
                                <th className="border p-2">Question</th>
                                <th className="border p-2">Selected Option</th>
                                <th className="border p-2">Correct Option</th>
                                <th className="border p-2">Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user.answers.map((ans, idx) => (
                                <tr key={idx} className={ans.isCorrect ? "bg-green-100" : "bg-red-100"}>
                                    <td className="border p-2">{ans.quizSet || "N/A"}</td>
                                    <td className="border p-2">{ans.question}</td>
                                    <td className="border p-2">{ans.selectedOption}</td>
                                    <td className="border p-2">{ans.correctOption}</td>
                                    <td className="border p-2 font-bold">
                                        {ans.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

export default GenerateReport;