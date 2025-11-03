import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FiRefreshCw, FiCheckCircle, FiClock, FiInfo } from "react-icons/fi";

function CardManagement() {
    const [cardInfo, setCardInfo] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchCardInfo = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/questions/active-card-info`);
            setCardInfo(response.data);
        } catch (error) {
            console.error("Error fetching card info:", error);
            Swal.fire("Error", "Failed to load card information", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/questions/stats`);
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        fetchCardInfo();
        fetchStats();
    }, []);

    const handleGenerateCards = async () => {
        const result = await Swal.fire({
            title: 'Generate Weekly Cards?',
            text: 'This will create 3 new cards with 40 unique questions each for the current week.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, generate!'
        });

        if (!result.isConfirmed) return;

        try {
            setGenerating(true);
            const response = await axios.post(`${API_BASE_URL}/api/questions/generate-cards`);

            Swal.fire({
                title: 'Success!',
                html: `
                    <p>${response.data.message}</p>
                    <p class="text-sm text-gray-600 mt-2">
                        Week ${response.data.data.weekNumber}, ${response.data.data.year}<br/>
                        Card 1: ${response.data.data.cardCounts.card1} questions<br/>
                        Card 2: ${response.data.data.cardCounts.card2} questions<br/>
                        Card 3: ${response.data.data.cardCounts.card3} questions
                    </p>
                `,
                icon: 'success'
            });

            fetchCardInfo();
            fetchStats();
        } catch (error) {
            console.error("Error generating cards:", error);
            Swal.fire(
                "Error",
                error.response?.data?.message || "Failed to generate cards",
                "error"
            );
        } finally {
            setGenerating(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="p-10 max-w-screen-xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading card information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 max-w-screen-xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Weekly Card Management</h1>
                <p className="text-gray-600">
                    Manage and generate weekly quiz cards with unique questions
                </p>
            </div>

            {/* Card Generation Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md mb-8 border border-blue-200">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                            <FiRefreshCw className="mr-2" />
                            Generate New Cards
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Creates 3 cards with 40 unique questions each for the current week
                        </p>
                        {stats && (
                            <div className="text-sm text-gray-700 space-y-1">
                                <p><strong>Total Questions:</strong> {stats.total}</p>
                                <p><strong>Never Used:</strong> {stats.usage.neverUsed}</p>
                                <p><strong>Available:</strong> {stats.usage.neverUsed + stats.usage.usedOnce}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleGenerateCards}
                        disabled={generating}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            generating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                        }`}
                    >
                        {generating ? (
                            <>
                                <FiRefreshCw className="inline animate-spin mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FiRefreshCw className="inline mr-2" />
                                Generate Cards
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Current Card Info */}
            {cardInfo && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <FiInfo className="mr-2 text-blue-500" />
                        Current Active Card
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Week Number</p>
                            <p className="text-2xl font-bold text-gray-800">
                                Week {cardInfo.weekNumber}, {cardInfo.year}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Status</p>
                            <p className={`text-lg font-semibold flex items-center ${
                                cardInfo.isActive ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {cardInfo.isActive ? (
                                    <>
                                        <FiCheckCircle className="mr-2" />
                                        Active
                                    </>
                                ) : (
                                    <>
                                        <FiClock className="mr-2" />
                                        Inactive
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="text-sm font-medium text-gray-800">
                                {formatDate(cardInfo.startDate)}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">End Date</p>
                            <p className="text-sm font-medium text-gray-800">
                                {formatDate(cardInfo.endDate)}
                            </p>
                        </div>
                    </div>

                    {/* Card Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((cardNum) => (
                            <div
                                key={cardNum}
                                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                            >
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                                    Card {cardNum}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Questions:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {cardInfo.cards[`card${cardNum}`]?.count || 0}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Question Statistics */}
            {stats && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Question Statistics
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-600 mb-1">Total Questions</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Never Used</p>
                            <p className="text-3xl font-bold text-green-600">{stats.usage.neverUsed}</p>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-gray-600 mb-1">Used Once</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.usage.usedOnce}</p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-gray-600 mb-1">Used Multiple</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.usage.usedMultiple}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {/* By Difficulty */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-3">By Difficulty</h3>
                            <div className="space-y-2">
                                {Object.entries(stats.byDifficulty).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 capitalize">{key}:</span>
                                        <span className="font-semibold text-gray-800">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* By Type */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-3">By Type</h3>
                            <div className="space-y-2">
                                {Object.entries(stats.byType).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 capitalize">{key}:</span>
                                        <span className="font-semibold text-gray-800">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CardManagement;
