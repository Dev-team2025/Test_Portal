import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const [questionTypes, setQuestionTypes] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestionTypes = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/quiz/question-types");
                setQuestionTypes(res.data.questionTypes);
            } catch (err) {
                console.error("Failed to fetch question types:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestionTypes();
    }, []);

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
    };

    const handleStartTest = () => {
        if (!selectedType) {
            alert("Please select a question type to start the test.");
            return;
        }

        navigate(`/quiz?question_type=${encodeURIComponent(selectedType)}`);
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '600px', margin: 'auto' }}>
            <h2>Admin Dashboard</h2>
            <p>Select a question type to assign a quiz for students:</p>

            {loading ? (
                <p>Loading question types...</p>
            ) : questionTypes.length === 0 ? (
                <p>No question types available.</p>
            ) : (
                <>
                    <label htmlFor="type-select" style={{ fontWeight: 'bold' }}>
                        Choose a Question Type:
                    </label>
                    <select
                        id="type-select"
                        value={selectedType}
                        onChange={handleTypeChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '1rem',
                            margin: '10px 0 20px'
                        }}
                    >
                        <option value="">-- Select a Question Type --</option>
                        {questionTypes.map((type, index) => (
                            <option key={index} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleStartTest}
                        disabled={!selectedType}
                        style={{
                            padding: '12px 20px',
                            fontSize: '1rem',
                            backgroundColor: selectedType ? '#28a745' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: selectedType ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Start Quiz for Students
                    </button>
                </>
            )}
        </div>
    );
}

export default AdminDashboard;
