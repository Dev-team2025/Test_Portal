import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import AlertMessage from '../AlertMessage/AlertMessage';

function Quiz() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setKey = searchParams.get("set");
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [results, setResults] = useState({});
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userId = localStorage.getItem("userId");

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Fetch questions
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `http://localhost:5000/api/questions/weekly-questions?card=${setKey}`
                );
                setQuestions(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching questions:", err);
                setError("Failed to load questions. Please try again later.");
                setLoading(false);
            }
        };

        if (setKey) fetchQuestions();
    }, [setKey]);

    // Timer effect
    useEffect(() => {
        if (submitted || loading) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [submitted, loading]);

    // Prevent cheating
    useEffect(() => {
        const preventCheating = (e) => {
            e.preventDefault();
            Swal.fire({
                icon: "warning",
                title: "Restricted Action",
                text: "This action is not allowed during the quiz.",
                timer: 3000,
                showConfirmButton: false,
            });
        };

        const handleTabSwitch = () => {
            if (!submitted) {
                Swal.fire({
                    icon: "warning",
                    title: "Tab Switch Detected",
                    text: "Your quiz has been auto-submitted due to leaving the page.",
                    timer: 3000,
                    showConfirmButton: false,
                });
                handleSubmitTest();
            }
        };

        // Add event listeners
        const events = ['copy', 'cut', 'paste', 'contextmenu'];
        events.forEach(event => {
            document.addEventListener(event, preventCheating);
        });
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") handleTabSwitch();
        });

        return () => {
            // Cleanup event listeners
            events.forEach(event => {
                document.removeEventListener(event, preventCheating);
            });
            document.removeEventListener("visibilitychange", handleTabSwitch);
        };
    }, [submitted]);

    const handleAnswerSelect = (questionId, selectedOption) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleSubmitTest = async () => {
        if (submitted) return;

        try {
            const answersToSubmit = Object.keys(answers).map(questionId => ({
                questionId,
                selectedOption: answers[questionId],
                isCorrect: questions.find(q => q._id === questionId)?.correctOption === answers[questionId],
                setNumber: setKey
            }));

            // Submit answers
            await axios.post("http://localhost:5000/api/answers/store", {
                answers: answersToSubmit,
                userId
            });

            // Calculate score
            const calculatedScore = answersToSubmit.filter(a => a.isCorrect).length;
            setScore(calculatedScore);
            setSubmitted(true);

            // Set results for display
            const resultsObj = {};
            answersToSubmit.forEach(answer => {
                resultsObj[answer.questionId] = {
                    isCorrect: answer.isCorrect,
                    selectedOption: answer.selectedOption
                };
            });
            setResults(resultsObj);

            Swal.fire({
                icon: "success",
                title: "Quiz Submitted!",
                text: `Your score: ${calculatedScore}/${questions.length}`,
            });

        } catch (err) {
            console.error("Error storing answers:", err);
            Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: "Could not submit your answers. Please try again.",
            });
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p>Loading questions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
                    <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error Loading Quiz</h2>
                    <p className="mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center p-6 bg-yellow-50 rounded-lg max-w-md">
                    <XCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
                    <p className="mb-4">There are no questions for this quiz set.</p>
                    <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <AlertMessage />

            <div className="max-w-6xl mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-4">
                {submitted ? (
                    <div className="space-y-6">
                        <div className="text-center">
                            {score >= questions.length / 2 ? (
                                <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-100 mb-4">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                            ) : (
                                <div className="inline-flex items-center justify-center p-4 rounded-full bg-red-100 mb-4">
                                    <XCircle className="h-12 w-12 text-red-600" />
                                </div>
                            )}
                            <h2 className="text-2xl font-bold">Test Completed!</h2>
                            <p className="text-lg mt-2">
                                Your Score: <span className="font-bold">{score}</span> out of <span className="font-bold">{questions.length}</span>
                            </p>
                            <p className="text-gray-600 mt-2">
                                Set {setKey} - {['Monday', 'Wednesday', 'Friday'][setKey - 1]} Quiz
                            </p>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Answer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {questions.map((q) => {
                                        const result = results[q._id] || {};
                                        const userAnswer = answers[q._id];
                                        const correctAnswer = q.correctOption.toUpperCase();
                                        const isCorrect = result.isCorrect;

                                        return (
                                            <tr key={q._id} className={isCorrect ? "bg-green-50" : "bg-red-50"}>
                                                <td className="px-4 py-3 whitespace-normal text-sm text-gray-900">{q.question}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    {userAnswer ? (
                                                        <span>
                                                            <span className="font-bold">{userAnswer}</span> - {q.options[userAnswer.toLowerCase()]}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">Not answered</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className="font-bold">{correctAnswer}</span> - {q.options[correctAnswer.toLowerCase()]}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {isCorrect ? (
                                                            <>
                                                                <Check className="h-3 w-3 mr-1" /> Correct
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-3 w-3 mr-1" /> Incorrect
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center mt-6">
                            <Button onClick={() => navigate("/dashboard")}>
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Set {setKey} - {['Monday', 'Wednesday', 'Friday'][setKey - 1]} Quiz
                            </div>
                            <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <span className="font-medium text-yellow-700">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Question Panel */}
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-500 mb-2">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </h3>
                                <p className="text-xl font-medium text-gray-900">
                                    {currentQuestion.question}
                                </p>
                            </div>

                            {/* Options Panel */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-700">Select your answer:</h3>
                                <div className="space-y-3">
                                    {['a', 'b', 'c', 'd'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleAnswerSelect(currentQuestion._id, opt.toUpperCase())}
                                            className={`w-full text-left p-4 rounded-lg border transition-all ${answers[currentQuestion._id] === opt.toUpperCase()
                                                    ? "bg-blue-50 border-blue-400 ring-2 ring-blue-200"
                                                    : "border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${answers[currentQuestion._id] === opt.toUpperCase()
                                                        ? "bg-blue-500 border-blue-500 text-white"
                                                        : "bg-white border-gray-400"
                                                    }`}>
                                                    {answers[currentQuestion._id] === opt.toUpperCase() && (
                                                        <Check className="h-3 w-3" />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-medium uppercase">{opt}.</span> {currentQuestion.options[opt]}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between pt-4">
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
                                disabled={currentQuestionIndex === 0}
                                variant="outline"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>

                            {currentQuestionIndex < questions.length - 1 ? (
                                <Button
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    variant="default"
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmitTest}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Submit Quiz <Check className="h-4 w-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Quiz;