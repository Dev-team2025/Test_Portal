import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function GenerateReport() {
    const [reportData, setReportData] = useState([]);
    const [selectedQuizSet, setSelectedQuizSet] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const [searchCollege, setSearchCollege] = useState("");
    const [searchEmail, setSearchEmail] = useState("");

    const fetchReportData = async (quizSet, college, email) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/report/quiz-report`, {
                params: {
                    quizSet,
                    college,
                    email
                }
            });
            setReportData(res.data);
        } catch (err) {
            console.error("Error fetching report:", err);
            alert("Failed to fetch report data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData(selectedQuizSet, searchCollege, searchEmail);
    }, [selectedQuizSet, searchCollege, searchEmail]);

    const handleDownload = () => {
        if (reportData.length === 0) {
            alert("No data available for download");
            return;
        }

        // Prepare Excel data with simplified question information
        const excelData = reportData.map(user => {
            const row = {
                "User ID": user.userId,
                "Name": user.fullname,
                "Email": user.email,
                "College": user.college || "N/A",
                "USN": user.usn || "N/A",
                "Branch": user.branch || "N/A",
                "Year of Passing": user.yop || "N/A"
            };

            // Add each question response (just the selected option)
            user.answers.forEach((answer, index) => {
                const questionNumber = index + 1;

                // User's selected answer (a, b, c, d, or N/A)
                row[`Q${questionNumber}`] = answer.selectedOption === 'N/A'
                    ? 'Not Answered'
                    : answer.selectedOption.toUpperCase();

                // Mark correct answers with *
                if (answer.isCorrect) {
                    row[`Q${questionNumber}`] += ' (Correct)';
                }
            });

            // Add total score
            const correctAnswers = user.answers.filter(a => a.isCorrect).length;
            row["Total Score"] = correctAnswers;
            row["Percentage"] = user.answers.length > 0
                ? `${((correctAnswers / user.answers.length) * 100).toFixed(2)}%`
                : "0%";

            return row;
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Auto-size columns
        const wscols = [
            { wch: 20 }, // User ID
            { wch: 25 }, // Name
            { wch: 30 }, // Email
            { wch: 15 }, // College
            { wch: 15 }, // USN
            { wch: 15 }, // Branch
            { wch: 15 }, // Year of Passing
            // Question columns will be auto-sized
            { wch: 15 }, // Total Score
            { wch: 15 }  // Percentage
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Report");

        // Generate file name based on quiz set
        const quizSetNames = {
            "1": "MondayTest",
            "2": "WednesdayTest",
            "3": "FridayTest"
        };
        const fileName = `${quizSetNames[selectedQuizSet]}_Report.xlsx`;

        // Download the file
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Quiz Report Generator</h2>

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex gap-4 items-center">
                    <select
                        value={selectedQuizSet}
                        onChange={(e) => setSelectedQuizSet(e.target.value)}
                        className="border px-3 py-2 rounded w-48"
                    >
                        <option value="1">Monday Test</option>
                        <option value="2">Wednesday Test</option>
                        <option value="3">Friday Test</option>
                    </select>

                    <button
                        onClick={handleDownload}
                        disabled={isLoading || reportData.length === 0}
                        className={`px-4 py-2 rounded text-white ${isLoading || reportData.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {isLoading ? "Generating..." : "Download Excel Report"}
                    </button>
                </div>

                <div className="flex gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Search by college"
                        value={searchCollege}
                        onChange={(e) => setSearchCollege(e.target.value)}
                        className="border px-3 py-2 rounded w-64"
                        autoComplete="organization"
                    />
                    <input
                        type="text"
                        placeholder="Search by email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="border px-3 py-2 rounded w-64"
                        autoComplete="email"
                    />
                </div>
            </div>

            {isLoading && <p>Loading report data...</p>}

            {reportData.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Report Summary</h3>
                    <p>Total Users: {reportData.length}</p>
                    <p>Total Questions: {reportData[0]?.questions?.length || 0}</p>
                    <p>Average Score: {
                        (reportData.reduce((sum, user) => sum + user.answers.filter(a => a.isCorrect).length, 0) /
                            (reportData.length * (reportData[0]?.questions?.length || 1)) * 100
                        ).toFixed(2)}%</p>
                </div>
            )}
        </div>
    );
}

export default GenerateReport;