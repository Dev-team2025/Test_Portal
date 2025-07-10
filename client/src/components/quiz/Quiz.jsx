import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Check,
    Trophy, Target, AlertTriangle, Loader2, Bookmark, Flag,
    BarChart2, Award, Home, RotateCw, Info, Maximize2
} from 'lucide-react';
import { jwtDecode } from "jwt-decode";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    withCredentials: true,
    timeout: 10000,
});

const Quiz = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setKey = searchParams.get("set");
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(1800);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [visibilityWarning, setVisibilityWarning] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    // Disable text selection, right-click, and keyboard shortcuts
    useEffect(() => {
        const preventDefault = (e) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'U') ||
                e.key === 'PrintScreen'
            ) {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('selectstart', (e) => e.preventDefault());
        document.addEventListener('keydown', preventDefault);

        return () => {
            document.removeEventListener('contextmenu', (e) => e.preventDefault());
            document.removeEventListener('selectstart', (e) => e.preventDefault());
            document.removeEventListener('keydown', preventDefault);
        };
    }, []);

    // Fullscreen handling
    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => setFullscreen(true))
                .catch(err => console.error('Fullscreen error:', err));
        } else {
            document.exitFullscreen()
                .then(() => setFullscreen(false));
        }
    };

    // Detect fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Tab switching detection
    useEffect(() => {
        if (submitted || loading || questions.length === 0) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                const newCount = visibilityWarning + 1;
                setVisibilityWarning(newCount);
                setShowWarningModal(true);

                if (newCount >= 3) {
                    handleSubmitTest();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [submitted, loading, questions.length, visibilityWarning]);

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (!setKey || !['1', '2', '3'].includes(setKey)) {
                throw new Error("Invalid quiz set selected");
            }

            // Store start time in localStorage
            localStorage.setItem('quizStartTime', Date.now());

            const res = await api.get(`/questions/weekly-questions?card=${setKey}`);

            if (!res.data || !Array.isArray(res.data)) {
                throw new Error("Invalid response format from server");
            }

            if (res.data.length === 0) {
                throw new Error("No questions available for this set");
            }

            setQuestions(res.data);

            const initialMarked = {};
            const initialAnswers = {};
            res.data.forEach(q => {
                initialMarked[q._id] = false;
                initialAnswers[q._id] = null;
            });
            setMarkedForReview(initialMarked);
            setAnswers(initialAnswers);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching questions:", err);
            setError(err.response?.data?.message || err.message || "Failed to load questions");
            setLoading(false);
            setQuestions([]);
        }
    }, [setKey]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    useEffect(() => {
        if (submitted || loading || questions.length === 0) return;

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
    }, [submitted, loading, questions.length]);

    const handleAnswerSelect = (questionId, selectedOption) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    };

    const toggleMarkForReview = (questionId) => {
        if (submitted) return;
        setMarkedForReview(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    };

    const handleSubmitTest = async () => {
        if (submitted || submitting) return;

        try {
            setSubmitting(true);
            setError(null);

            const token = localStorage.getItem("token");
            const userData = jwtDecode(token);
            const userId = userData?._id || userData?.id;

            if (!userId) {
                throw new Error("User not authenticated");
            }

            const formattedAnswers = questions.map(q => ({
                questionId: q._id,
                setNumber: q.set?.toString() || setKey,
                selectedOption: answers[q._id]
            }));

            const startTime = localStorage.getItem('quizStartTime');
            const response = await api.post("/answers/store", {
                userId,
                answers: formattedAnswers
            }, {
                headers: {
                    'X-Quiz-Start-Time': startTime
                }
            });

            // Update questions with server's evaluation
            const updatedQuestions = questions.map(q => {
                const serverAnswer = response.data.answers.find(a =>
                    a.questionId === q._id
                );
                return {
                    ...q,
                    isCorrect: serverAnswer?.isCorrect || false,
                    serverCorrectOption: serverAnswer?.isCorrect ?
                        answers[q._id] : null
                };
            });

            setQuestions(updatedQuestions);
            setScore(response.data.correctAnswers);
            setSubmitted(true);

            if (response.data.correctAnswers >= questions.length * 0.7) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        } catch (err) {
            console.error("Error submitting answers:", err);
            setError(err.response?.data?.error || err.message || "Failed to submit answers");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeColor = () => {
        if (timeLeft > 600) return "text-green-600 bg-green-50 border-green-200";
        if (timeLeft > 300) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const WarningModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-center mb-4">
                    {visibilityWarning >= 3 ? 'Quiz Submitted!' : 'Warning'}
                </h2>
                <p className="text-center mb-6">
                    {visibilityWarning >= 3
                        ? 'Your quiz has been submitted due to multiple tab switches.'
                        : `Please stay on this page. ${3 - visibilityWarning} more warnings will result in automatic submission.`}
                </p>
                <button
                    onClick={() => {
                        setShowWarningModal(false);
                        if (visibilityWarning >= 3) {
                            navigate("/dashboard");
                        }
                    }}
                    className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {visibilityWarning >= 3 ? 'View Results' : 'I Understand'}
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-4 text-lg">Loading quiz questions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                    <h2 className="text-xl font-bold mt-4 text-red-600">Error Loading Quiz</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <div className="mt-4 flex gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (questions.length === 0 && !loading && !error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md p-6 bg-yellow-50 rounded-lg">
                    <Info className="h-12 w-12 text-yellow-500 mx-auto" />
                    <h2 className="text-xl font-bold mt-4">No Questions Available</h2>
                    <p className="mt-2 text-gray-600">There are no questions for this quiz set.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progressPercentage = (currentQuestionIndex + 1) / questions.length * 100;
    const answeredCount = Object.values(answers).filter(a => a !== null).length;

    return (
        <div className="min-h-screen bg-gray-50 p-4 select-none">
            {showConfetti && (
                <div className="fixed inset-0 z-50 pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl font-bold text-white bg-blue-500/90 px-8 py-4 rounded-full shadow-lg">
                            Great Job! 🎉
                        </div>
                    </div>
                </div>
            )}

            {showWarningModal && <WarningModal />}

            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="w-full md:w-auto">
                            <div className="text-sm font-medium text-blue-600 mb-2">
                                Set {setKey} - Question {currentQuestionIndex + 1} of {questions.length}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
                            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-medium">{answeredCount}</span>
                                <span className="text-sm text-gray-500">Answered</span>
                            </div>

                            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                                <Bookmark className="h-5 w-5 text-yellow-600" />
                                <span className="font-medium">
                                    {Object.values(markedForReview).filter(Boolean).length}
                                </span>
                                <span className="text-sm text-gray-500">Marked</span>
                            </div>

                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${getTimeColor()}`}>
                                <Clock className="h-5 w-5" />
                                <span className="font-bold">{formatTime(timeLeft)}</span>
                            </div>

                            <button
                                onClick={handleFullscreen}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-200 hover:bg-purple-100"
                            >
                                <Maximize2 className="h-5 w-5" />
                                <span>{fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {submitted ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="mb-6">
                            <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                            <h2 className="text-2xl font-bold mt-4">Quiz Completed!</h2>
                            <p className="text-gray-600 mt-2">
                                You scored {score} out of {questions.length}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-4 mt-6">
                                <div
                                    className="bg-blue-600 h-4 rounded-full"
                                    style={{ width: `${(score / questions.length) * 100}%` }}
                                ></div>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                {score >= questions.length * 0.7 ? "Great job!" : "Keep practicing!"}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                            >
                                <Home className="h-5 w-5" />
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                            >
                                <RotateCw className="h-5 w-5" />
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">Q{currentQuestionIndex + 1}</span>
                                        <span>Question</span>
                                    </div>
                                    <button
                                        onClick={() => toggleMarkForReview(currentQuestion._id)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-md ${markedForReview[currentQuestion._id]
                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                            : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                        disabled={submitted}
                                    >
                                        <Bookmark className="h-4 w-4" />
                                        {markedForReview[currentQuestion._id] ? 'Marked' : 'Mark'}
                                    </button>
                                </div>

                                <div className="p-6">
                                    <p className="text-lg font-medium text-gray-800 mb-6">
                                        {currentQuestion.question}
                                    </p>

                                    {currentQuestion.imageUrl && (
                                        <div className="mb-6 border rounded-lg overflow-hidden">
                                            <img
                                                src={currentQuestion.imageUrl}
                                                alt="Question illustration"
                                                className="w-full h-auto max-h-64 object-contain mx-auto"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-blue-600" />
                                    Select your answer
                                </h2>

                                <div className="space-y-4">
                                    {['a', 'b', 'c', 'd'].map(opt => {
                                        const isSelected = answers[currentQuestion._id] === opt.toUpperCase();
                                        const isCorrect = submitted && currentQuestion.isCorrect && isSelected;
                                        const isServerCorrect = submitted && !isSelected &&
                                            currentQuestion.serverCorrectOption === opt.toUpperCase();

                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => handleAnswerSelect(currentQuestion._id, opt.toUpperCase())}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                                    ? submitted
                                                        ? isCorrect
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-red-500 bg-red-50'
                                                        : 'border-blue-500 bg-blue-50'
                                                    : isServerCorrect
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                disabled={submitted}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`flex-shrink-0 h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold ${isSelected
                                                            ? submitted
                                                                ? isCorrect
                                                                    ? 'bg-green-500 border-green-500 text-white'
                                                                    : 'bg-red-500 border-red-500 text-white'
                                                                : 'bg-blue-500 border-blue-500 text-white'
                                                            : isServerCorrect
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'bg-white border-gray-300 text-gray-500'
                                                            }`}
                                                    >
                                                        {isSelected || isServerCorrect ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            opt.toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-800">{currentQuestion.options[opt]}</span>
                                                        {isServerCorrect && (
                                                            <div className="text-xs text-green-600 mt-1">Correct Answer</div>
                                                        )}
                                                        {submitted && isSelected && !isCorrect && (
                                                            <div className="text-xs text-red-600 mt-1">Your Answer</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {(currentQuestion.explanation && (submitted || answers[currentQuestion._id])) && (
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                                            <Info className="h-4 w-4" />
                                            <span className="font-medium">Explanation</span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {currentQuestion.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
                                        disabled={currentQuestionIndex === 0 || submitted}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                        Previous
                                    </button>

                                    {currentQuestionIndex === questions.length - 1 ? (
                                        <button
                                            onClick={handleSubmitTest}
                                            disabled={submitted || submitting}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    Submit Quiz
                                                    <Check className="h-5 w-5" />
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1))}
                                            disabled={submitted}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            Next
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap justify-center gap-2">
                                    {questions.map((q, index) => (
                                        <button
                                            key={q._id}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                            disabled={submitted}
                                            className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${index === currentQuestionIndex
                                                ? 'bg-blue-500 text-white'
                                                : answers[q._id]
                                                    ? markedForReview[q._id]
                                                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                                                        : submitted
                                                            ? q.isCorrect
                                                                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                                                : 'bg-red-100 text-red-800 border-2 border-red-300'
                                                            : 'bg-green-100 text-green-800 border-2 border-green-300'
                                                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                                                }`}
                                        >
                                            {index + 1}
                                            {markedForReview[q._id] && (
                                                <Bookmark className="absolute -mt-6 h-3 w-3 text-yellow-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Quiz;