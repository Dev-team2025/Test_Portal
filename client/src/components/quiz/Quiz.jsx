import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "react-router-dom";

const Quiz = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [topic, setTopic] = useState("all");
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const location = useLocation();
    const { topic: urlTopic } = useParams();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        setTopic(urlTopic || queryParams.get("topic") || "all");
    }, [location, urlTopic]);

    useEffect(() => {
        if (!topic) return;

        setLoading(true);
        setError(null);

        axios.get(`http://localhost:5000/api/quiz/questions?topic=${topic}`)
            .then(res => {
                setQuestions(res.data.questions);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching questions:", err);
                setError("Failed to load questions. Please try again.");
                setLoading(false);
            });
    }, [topic]);

    const handleAnswerSelect = (questionId, selectedOption) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    };

    const handleSubmitTest = () => {
        if (!Object.keys(answers).length) {
            alert("Please answer at least one question before submitting.");
            return;
        }

        axios.post("http://localhost:5000/api/quiz/submit", {
            userId: "student_123",
            answers,
            topic
        })
            .then(res => {
                setScore(res.data.score);
                setResults(res.data.results);
                setSubmitted(true);
            })
            .catch(err => {
                console.error("Error submitting quiz:", err);
                alert("There was an error submitting your quiz.");
            });
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-lg">🔄 Loading questions...</div>;
    if (error) return <div className="text-center text-red-500 text-lg">{error}</div>;
    if (!questions.length) return <div className="text-center text-gray-500 text-lg">🚫 No questions found for this topic.</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            {submitted ? (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-500">✅ Test Completed!</h2>
                    <h3 className="text-lg font-semibold">Your Score: {score} / {questions.length}</h3>
                </div>
            ) : (
                <>
                    <Card className="mb-4">
                        <CardHeader>
                            <h3 className="text-xl font-bold">Question {currentQuestionIndex + 1} of {questions.length}</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">{questions[currentQuestionIndex]?.question_text}</p>
                            <ul className="mt-4">
                                {["A", "B", "C", "D"].map(option => (
                                    <li key={option} className="mb-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name={`question-${questions[currentQuestionIndex]?.question_id}`}
                                                value={option}
                                                checked={answers[questions[currentQuestionIndex]?.question_id] === option}
                                                onChange={() => handleAnswerSelect(questions[currentQuestionIndex]?.question_id, option)}
                                            />
                                            <span>{questions[currentQuestionIndex]?.[`option_${option.toLowerCase()}`]}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between">
                        <Button
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            disabled={currentQuestionIndex === 0}
                            className="bg-gray-400 hover:bg-gray-500 px-4 py-2 rounded"
                        >
                            ⬅️ Previous
                        </Button>

                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Next ➡️
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmitTest}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                            >
                                Submit Quiz ✅
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Quiz;