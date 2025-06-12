import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Analyse from "../dashboard/Analyse";
import AlertMessage from "../AlertMessage/AlertMessage";

const Quiz = () => {
    const userId = localStorage.getItem("userId");
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [topic] = useState("all");
    const [results, setResults] = useState({});
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60 * 30); // 30 mins for 40 questions

    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        axios
            .get(`http://localhost:5000/api/quiz/questions?userId=${userId}`)
            .then((res) => {
                setQuestions(res.data.questions);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching questions:", err);
                setError("Failed to load questions. Please try again.");
                setLoading(false);
            });
    }, [userId]);

    useEffect(() => {
        if (submitted) return;

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    handleSubmitTest();
                    Swal.fire({
                        icon: "info",
                        title: "Time's up!",
                        text: "Your quiz has been auto-submitted.",
                        confirmButtonColor: "#3B82F6",
                    });
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [submitted]);

    const handleAnswerSelect = (questionId, selectedOption) => {
        setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    };

    const handleSubmitTest = () => {
        if (!userId) {
            Swal.fire({
                icon: "error",
                title: "Authentication Error",
                text: "Please login to submit the quiz",
                confirmButtonColor: "#3085d6",
            });
            return;
        }

        if (!Object.keys(answers).length) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete",
                text: "Please answer at least one question before submitting.",
                confirmButtonColor: "#3085d6",
            });
            return;
        }

        axios
            .post("http://localhost:5000/api/quiz/submit", {
                userId,
                answers,
                topic,
            })
            .then((res) => {
                setScore(res.data.score);
                setResults(res.data.results);
                setSubmitted(true);

                Swal.fire({
                    icon: "success",
                    title: "Quiz Submitted!",
                    text: `Your score is ${res.data.score} out of ${questions.length}`,
                    confirmButtonColor: "#10B981",
                });
            })
            .catch((err) => {
                console.error("Error submitting quiz:", err);
                Swal.fire({
                    icon: "error",
                    title: "Submission Failed",
                    text: "There was an error submitting your quiz. Please try again.",
                    confirmButtonColor: "#EF4444",
                });
            });
    };

    // Anti-Cheating Features
    useEffect(() => {
        const handleCopyPaste = (e) => {
            e.preventDefault();
            Swal.fire({
                icon: "warning",
                title: "Action Blocked",
                text: "Copying or pasting is not allowed during the quiz.",
                confirmButtonColor: "#F59E0B",
            });
        };

        const handleVisibilityChange = () => {
            if (document.hidden && !submitted) {
                handleSubmitTest();
                Swal.fire({
                    icon: "info",
                    title: "Quiz Submitted",
                    text: "Tab switching is not allowed. Your quiz has been submitted.",
                    confirmButtonColor: "#3B82F6",
                });
            }
        };

        const handlePrintScreen = (e) => {
            if (e.key === "PrintScreen") {
                document.body.innerHTML = "";
            }
        };

        document.addEventListener("copy", handleCopyPaste);
        document.addEventListener("paste", handleCopyPaste);
        document.addEventListener("cut", handleCopyPaste);
        document.addEventListener("contextmenu", handleCopyPaste);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("keydown", handlePrintScreen);

        return () => {
            document.removeEventListener("copy", handleCopyPaste);
            document.removeEventListener("paste", handleCopyPaste);
            document.removeEventListener("cut", handleCopyPaste);
            document.removeEventListener("contextmenu", handleCopyPaste);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("keydown", handlePrintScreen);
        };
    }, [submitted, answers]);

    if (!userId) {
        return (
            <div className="flex justify-center items-center h-screen text-lg">
                🔒 Please login to access the quiz
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg">
                🔄 Loading questions...
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 text-lg">{error}</div>;
    }

    if (!questions.length) {
        return (
            <div className="text-center text-gray-500 text-lg">
                🚫 No questions found.
            </div>
        );
    }

    return (
        <>
            {/* Floating Timer */}
            <div className="fixed top-60 right-6 z-50 bg-yellow-100 border-2 border-yellow-400 rounded-xl shadow-md px-4 py-3 flex items-center space-x-2">
                <i className="fa-solid fa-clock text-yellow-600 text-lg"></i>
                <span className="font-bold text-yellow-700 text-md">
                    {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                    {String(timeLeft % 60).padStart(2, "0")}
                </span>
            </div>

            <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-4">
                {submitted ? (
                    <div className="space-y-6">
                        <div className="text-center flex flex-col items-center">
                            {score >= questions.length / 2 ? (
                                <CheckCircleIcon style={{ fontSize: 40, color: "#22C55E" }} />
                            ) : (
                                <ErrorIcon style={{ fontSize: 40, color: "#EF4444" }} />
                            )}
                            <h2 className="text-2xl font-bold mt-2">✅ Test Completed!</h2>
                            <h3 className="text-xl font-semibold">
                                Your Score: {score} / {questions.length}
                            </h3>
                        </div>

                        {/* Results Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Answer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {questions.map((question) => {
                                        const result = results[question._id] || {};
                                        const isCorrect = result.isCorrect || false;
                                        const selectedOption = answers[question._id] || "Not answered";
                                        const correctAnswer = question.correct_answer;

                                        return (
                                            <tr
                                                key={question._id}
                                                className={isCorrect ? "bg-green-50" : "bg-red-50"}
                                            >
                                                <td className="px-6 py-4 whitespace-normal max-w-xs">
                                                    <p className="font-medium">{question.question_text}</p>
                                                    {result.explanation && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Explanation: {result.explanation}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {selectedOption} - {question[`option_${selectedOption.toLowerCase()}`]}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {correctAnswer} - {question[`option_${correctAnswer.toLowerCase()}`]}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {isCorrect ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Correct</span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Incorrect</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={() => setShowAnalysis(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                            >
                                🔍 View Analysis
                            </Button>
                        </div>

                        {showAnalysis && (
                            <div className="mt-6">
                                <Analyse userId={userId} />
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <AlertMessage />
                        <div className="flex flex-col md:flex-row gap-6 items-stretch">
                            <Card className="flex-1 bg-blue-50 flex flex-col">
                                <CardHeader className="text-center">
                                    <h3 className="text-xl font-bold">
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-6 flex-grow flex items-center justify-center">
                                    <p className="text-gray-700 text-lg text-center">
                                        {questions[currentQuestionIndex]?.question_text}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="flex-1 bg-green-50 flex flex-col">
                                <CardHeader className="text-center">
                                    <h3 className="text-xl font-bold">Options</h3>
                                </CardHeader>
                                <CardContent className="p-6 flex-grow flex flex-col justify-center">
                                    <ul className="space-y-4 w-full">
                                        {["A", "B", "C", "D"].map((option) => (
                                            <li key={option} className="w-full">
                                                <label className="block w-full">
                                                    <div
                                                        className={`p-4 rounded-lg transition-all w-full ${answers[questions[currentQuestionIndex]?._id] === option
                                                            ? "bg-indigo-100 border-2 border-indigo-400"
                                                            : "bg-white border border-gray-300 hover:bg-indigo-50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-3 justify-start">
                                                            <input
                                                                type="radio"
                                                                name={`question-${questions[currentQuestionIndex]?._id}`}
                                                                value={option}
                                                                checked={
                                                                    answers[questions[currentQuestionIndex]?._id] === option
                                                                }
                                                                onChange={() =>
                                                                    handleAnswerSelect(questions[currentQuestionIndex]?._id, option)
                                                                }
                                                                className="h-5 w-5 text-indigo-600"
                                                            />
                                                            <span className="font-medium">
                                                                {option}.{" "}
                                                                {questions[currentQuestionIndex][`option_${option.toLowerCase()}`]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-between mt-6">
                            <Button
                                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                                disabled={currentQuestionIndex === 0}
                                className="bg-gray-400 hover:bg-gray-500 px-4 py-2 rounded flex items-center"
                            >
                                <i className="fa-solid fa-arrow-left mr-2"></i> Previous
                            </Button>

                            {currentQuestionIndex < questions.length - 1 ? (
                                <Button
                                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                                >
                                    Next <i className="fa-solid fa-arrow-right ml-2"></i>
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmitTest}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
                                >
                                    Submit Quiz <i className="fa-solid fa-check ml-2"></i>
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Quiz;
