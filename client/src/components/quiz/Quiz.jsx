import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Check,
    Trophy, Target, AlertTriangle, Loader2, Bookmark, Flag,
    BarChart2, Award, Home, RotateCw, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlertMessage from '../AlertMessage/AlertMessage';
import Confetti from 'react-confetti';

function Quiz() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setKey = searchParams.get("set");
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [results, setResults] = useState({});
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState("quiz");

    const userId = localStorage.getItem("userId");

    // Format time as MM:SS
    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Get time color based on remaining time
    const getTimeColor = useCallback(() => {
        if (timeLeft > 600) return "text-green-600 bg-green-50 border-green-200";
        if (timeLeft > 300) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200 animate-pulse";
    }, [timeLeft]);

    // Calculate progress percentage
    const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    // Calculate answered questions count
    const answeredCount = Object.keys(answers).length;

    // Calculate marked for review count
    const markedCount = Object.keys(markedForReview).filter(id => markedForReview[id]).length;

    // Fetch questions
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `http://localhost:5000/api/questions/weekly-questions?card=${setKey}`
                );
                setQuestions(res.data);

                // Initialize markedForReview state
                const initialMarked = {};
                res.data.forEach(q => {
                    initialMarked[q._id] = false;
                });
                setMarkedForReview(initialMarked);

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

    // Handle window resize for confetti
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleAnswerSelect = (questionId, selectedOption) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const toggleMarkForReview = (questionId) => {
        setMarkedForReview(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const fetchQuizStats = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/answers/stats?set=${setKey}`);
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching quiz stats:", err);
        }
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

            // Show confetti if score is above 70%
            if (calculatedScore / questions.length >= 0.7) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 8000);
            }

            // Set results for display
            const resultsObj = {};
            answersToSubmit.forEach(answer => {
                resultsObj[answer.questionId] = {
                    isCorrect: answer.isCorrect,
                    selectedOption: answer.selectedOption
                };
            });
            setResults(resultsObj);

            // Fetch stats after submission
            await fetchQuizStats();

            Swal.fire({
                icon: "success",
                title: "Quiz Submitted!",
                html: `
                    <div class="text-center">
                        <div class="text-4xl font-bold mb-2">${calculatedScore}/${questions.length}</div>
                        <div class="text-lg">${Math.round((calculatedScore / questions.length) * 100)}% Accuracy</div>
                        ${calculatedScore / questions.length >= 0.7 ?
                        '<div class="mt-4 text-green-600 font-medium">Great job! 🎉</div>' :
                        '<div class="mt-4 text-blue-600 font-medium">Keep practicing!</div>'}
                    </div>
                `,
                showConfirmButton: false,
                timer: 3000
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
                <Card className="p-8 shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-b-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Quiz</h2>
                        <p className="text-gray-600">Preparing your questions...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex justify-center items-center">
                <Card className="p-8 shadow-xl max-w-md border-0 bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-gray-800">Unable to Load Quiz</h2>
                        <p className="mb-6 text-gray-600">{error}</p>
                        <div className="flex justify-center space-x-4">
                            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                                <RotateCw className="h-4 w-4 mr-2" /> Try Again
                            </Button>
                            <Button onClick={() => navigate("/dashboard")} variant="outline">
                                <Home className="h-4 w-4 mr-2" /> Dashboard
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex justify-center items-center">
                <Card className="p-8 shadow-xl max-w-md border-0 bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-gray-800">No Questions Available</h2>
                        <p className="mb-6 text-gray-600">There are no questions for this quiz set.</p>
                        <Button onClick={() => navigate("/dashboard")} className="bg-yellow-600 hover:bg-yellow-700">
                            <Home className="h-4 w-4 mr-2" /> Back to Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.2}
                />
            )}

            <AlertMessage />

            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {submitted ? (
                    <Tabs defaultValue="results" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 max-w-xs mx-auto">
                            <TabsTrigger value="results" onClick={() => setActiveTab("results")}>
                                <BarChart2 className="h-4 w-4 mr-2" /> Results
                            </TabsTrigger>
                            <TabsTrigger value="stats" onClick={() => setActiveTab("stats")}>
                                <Award className="h-4 w-4 mr-2" /> Statistics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="results" className="space-y-8 animate-fade-in">
                            {/* Results Header */}
                            <Card className="border-0 shadow-2xl bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-sm">
                                <CardContent className="p-8">
                                    <div className="text-center">
                                        <div className="relative mb-6">
                                            {score >= (questions.length / 2) ? (
                                                <div className="inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg">
                                                    <Trophy className="h-16 w-16 text-white" />
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-r from-orange-400 to-red-500 shadow-lg">
                                                    <Target className="h-16 w-16 text-white" />
                                                </div>
                                            )}
                                            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full opacity-20 blur-lg"></div>
                                        </div>

                                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                            Quiz Completed!
                                        </h1>

                                        <div className="flex justify-center items-center space-x-8 mb-6">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-blue-600">{score}</div>
                                                <div className="text-sm text-gray-600">Correct</div>
                                            </div>
                                            <div className="text-4xl text-gray-300">/</div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-gray-600">{questions.length}</div>
                                                <div className="text-sm text-gray-600">Total</div>
                                            </div>
                                        </div>

                                        <Badge variant="outline" className="text-lg px-4 py-2 bg-blue-50 border-blue-200">
                                            Set {setKey} - {['Monday', 'Wednesday', 'Friday'][Number(setKey) - 1]} Quiz
                                        </Badge>

                                        <div className="mt-6">
                                            <Progress value={questions.length > 0 ? (score / questions.length) * 100 : 0} className="h-3" />
                                            <p className="text-sm text-gray-600 mt-2">
                                                {questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}% accuracy
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detailed Results */}
                            <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold text-gray-800">Detailed Results</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Answer</th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {questions.map((q, index) => {
                                                    const result = results[q._id] || {};
                                                    const userAnswer = answers[q._id];
                                                    const correctAnswer = q.correctOption.toUpperCase();
                                                    const isCorrect = result.isCorrect;

                                                    return (
                                                        <tr key={q._id} className={`transition-colors hover:bg-gray-50 ${isCorrect ? "bg-green-50/50" : "bg-red-50/50"}`}>
                                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                                <div className="flex items-start space-x-3">
                                                                    <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                                                                        {index + 1}
                                                                    </Badge>
                                                                    <div className="font-medium">{q.question}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm">
                                                                {userAnswer ? (
                                                                    <div className="flex items-center space-x-2">
                                                                        <Badge variant={isCorrect ? "default" : "destructive"} className="font-bold">
                                                                            {userAnswer}
                                                                        </Badge>
                                                                        <span className="text-gray-600">{q.options[userAnswer.toLowerCase()]}</span>
                                                                    </div>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-gray-500">
                                                                        Not answered
                                                                    </Badge>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm">
                                                                <div className="flex items-center space-x-2">
                                                                    <Badge variant="default" className="bg-green-600 font-bold">
                                                                        {correctAnswer}
                                                                    </Badge>
                                                                    <span className="text-gray-600">{q.options[correctAnswer.toLowerCase()]}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm">
                                                                <Badge variant={isCorrect ? "default" : "destructive"} className="flex items-center w-fit">
                                                                    {isCorrect ? (
                                                                        <>
                                                                            <Check className="h-3 w-3 mr-1" /> Correct
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <XCircle className="h-3 w-3 mr-1" /> Incorrect
                                                                        </>
                                                                    )}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-center space-x-4">
                                <Button
                                    onClick={() => navigate("/dashboard")}
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 shadow-lg"
                                >
                                    <Home className="h-4 w-4 mr-2" /> Back to Dashboard
                                </Button>
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="outline"
                                    size="lg"
                                    className="px-8 py-3"
                                >
                                    <RotateCw className="h-4 w-4 mr-2" /> Retake Quiz
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="stats" className="space-y-8 animate-fade-in">
                            {stats ? (
                                <>
                                    <Card className="border-0 shadow-2xl bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="text-2xl font-bold text-gray-800">Quiz Statistics</CardTitle>
                                            <CardDescription>How you compare with other learners</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-medium text-gray-600">Your Score</h3>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-600">
                                                        {Math.round((score / questions.length) * 100)}%
                                                    </Badge>
                                                </div>
                                                <Progress value={(score / questions.length) * 100} className="h-2" />
                                                <div className="mt-2 text-sm text-gray-500">
                                                    {score} out of {questions.length} correct
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-medium text-gray-600">Average Score</h3>
                                                    <Badge variant="outline" className="bg-purple-50 text-purple-600">
                                                        {Math.round(stats.averageScore)}%
                                                    </Badge>
                                                </div>
                                                <Progress value={stats.averageScore} className="h-2" />
                                                <div className="mt-2 text-sm text-gray-500">
                                                    Based on {stats.totalAttempts} attempts
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-medium text-gray-600">Your Rank</h3>
                                                    <Badge variant="outline" className="bg-green-50 text-green-600">
                                                        Top {stats.percentile}%
                                                    </Badge>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                                                        style={{ width: `${100 - stats.percentile}%` }}
                                                    ></div>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-500">
                                                    Better than {stats.percentile}% of participants
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="text-2xl font-bold text-gray-800">Question Analysis</CardTitle>
                                            <CardDescription>Review the most challenging questions</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {questions
                                                    .filter(q => stats.questionStats[q._id]?.correctPercentage < 50)
                                                    .sort((a, b) => stats.questionStats[a._id].correctPercentage - stats.questionStats[b._id].correctPercentage)
                                                    .slice(0, 3)
                                                    .map((q, i) => (
                                                        <div key={q._id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex items-center space-x-3">
                                                                    <Badge variant="destructive" className="font-bold">
                                                                        {i + 1}
                                                                    </Badge>
                                                                    <h4 className="font-medium text-gray-800">{q.question}</h4>
                                                                </div>
                                                                <Badge variant="outline" className="bg-red-50 text-red-600">
                                                                    Only {Math.round(stats.questionStats[q._id].correctPercentage)}% correct
                                                                </Badge>
                                                            </div>
                                                            <div className="ml-12">
                                                                <div className="text-sm text-gray-600 mb-2">
                                                                    <span className="font-medium">Correct Answer:</span> {q.options[q.correctOption.toLowerCase()]}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    <span className="font-medium">Explanation:</span> {q.explanation || "No explanation provided."}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        {/* Quiz Header */}
                        <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                                    <div>
                                        <Badge variant="outline" className="mb-2 bg-blue-50 border-blue-200 text-blue-700">
                                            Set {setKey} - {['Monday', 'Wednesday', 'Friday'][Number(setKey) - 1]} Quiz
                                        </Badge>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-sm text-gray-600">
                                                Question <span className="font-bold text-blue-600">{currentQuestionIndex + 1}</span> of <span className="font-bold">{questions.length}</span>
                                            </div>
                                            <Progress value={progressPercentage} className="w-32 h-2" />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Card className="bg-green-50 border-green-200 text-green-700">
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center space-x-2">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="font-medium">{answeredCount}</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Answered questions</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Card className="bg-yellow-50 border-yellow-200 text-yellow-700">
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Bookmark className="h-4 w-4" />
                                                            <span className="font-medium">{markedCount}</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Marked for review</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Card className={`${getTimeColor()} border-2 shadow-lg`}>
                                            <CardContent className="p-3">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="font-bold">{formatTime(timeLeft)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* Question Panel */}
                            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                                Q{currentQuestionIndex + 1}
                                            </Badge>
                                            <span>Question</span>
                                        </div>
                                        <Button
                                            onClick={() => toggleMarkForReview(currentQuestion._id)}
                                            variant={markedForReview[currentQuestion._id] ? "default" : "outline"}
                                            size="sm"
                                            className={markedForReview[currentQuestion._id] ? "bg-yellow-500 hover:bg-yellow-600" : "bg-white/10 hover:bg-white/20"}
                                        >
                                            {markedForReview[currentQuestion._id] ? (
                                                <>
                                                    <Bookmark className="h-4 w-4 mr-2 fill-current" /> Marked
                                                </>
                                            ) : (
                                                <>
                                                    <Bookmark className="h-4 w-4 mr-2" /> Mark for Review
                                                </>
                                            )}
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <p className="text-xl leading-relaxed text-gray-800 font-medium">
                                        {currentQuestion.question}
                                    </p>
                                    {currentQuestion.imageUrl && (
                                        <div className="mt-6 border rounded-lg overflow-hidden">
                                            <img
                                                src={currentQuestion.imageUrl}
                                                alt="Question illustration"
                                                className="w-full h-auto max-h-64 object-contain"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Options Panel */}
                            <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-gray-800 flex items-center space-x-2">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        <span>Select your answer</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {['a', 'b', 'c', 'd'].map((opt, index) => {
                                            const isSelected = answers[currentQuestion._id] === opt.toUpperCase();
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleAnswerSelect(currentQuestion._id, opt.toUpperCase())}
                                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg ${isSelected
                                                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md ring-2 ring-blue-200"
                                                        : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`flex-shrink-0 h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${isSelected
                                                            ? "bg-blue-500 border-blue-500 text-white shadow-md"
                                                            : "bg-white border-gray-300 text-gray-500"
                                                            }`}>
                                                            {isSelected ? (
                                                                <Check className="h-4 w-4" />
                                                            ) : (
                                                                opt.toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="text-lg text-gray-800">{currentQuestion.options[opt]}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {currentQuestion.explanation && answers[currentQuestion._id] && (
                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center space-x-2 text-blue-700 mb-2">
                                                <Info className="h-4 w-4" />
                                                <span className="font-medium">Explanation</span>
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                {currentQuestion.explanation}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Navigation */}
                        <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row justify-between items-center">
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
                                            disabled={currentQuestionIndex === 0}
                                            variant="outline"
                                            size="lg"
                                            className="px-6 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                                        </Button>

                                        <Button
                                            onClick={() => setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1))}
                                            disabled={currentQuestionIndex === questions.length - 1}
                                            variant="outline"
                                            size="lg"
                                            className="px-6 disabled:opacity-50"
                                        >
                                            Next <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {questions.map((q, index) => (
                                            <Tooltip key={q._id}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => setCurrentQuestionIndex(index)}
                                                        className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center ${index === currentQuestionIndex
                                                            ? "bg-blue-600 text-white shadow-lg transform scale-110"
                                                            : answers[q._id]
                                                                ? markedForReview[q._id]
                                                                    ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                                                                    : "bg-green-100 text-green-700 border-2 border-green-300"
                                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                            }`}
                                                    >
                                                        {index + 1}
                                                        {markedForReview[q._id] && (
                                                            <span className="absolute -top-1 -right-1">
                                                                <Bookmark className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                                            </span>
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Question {index + 1}</p>
                                                    {answers[q._id] && <p>Answered: {answers[q._id]}</p>}
                                                    {markedForReview[q._id] && <p>Marked for review</p>}
                                                </TooltipContent>
                                            </Tooltip>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={handleSubmitTest}
                                        size="lg"
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3 shadow-lg"
                                    >
                                        Submit Quiz <Check className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>

                                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                                    <div>
                                        <span className="font-medium">{answeredCount}</span> of <span className="font-medium">{questions.length}</span> answered
                                    </div>
                                    <div>
                                        <span className="font-medium">{timeLeft > 0 ? formatTime(timeLeft) : "Time's up!"}</span> remaining
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Quiz;