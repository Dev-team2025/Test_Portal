import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ResultTable() {
    const [groupedResults, setGroupedResults] = useState({});
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/result/all`);
                const answers = response.data.answers;

                const grouped = {};
                const questionMap = new Map(); // key: questionId, value: question object

                answers.forEach((ans) => {
                    const userId = ans.userId?._id;
                    const questionId = ans.questionId?._id;

                    if (!userId || !questionId) return;

                    // Store full question object
                    if (!questionMap.has(questionId)) {
                        questionMap.set(questionId, {
                            _id: questionId,
                            text: ans.questionId.question,
                        });
                    }

                    if (!grouped[userId]) {
                        grouped[userId] = {
                            user: ans.userId,
                            answers: {}
                        };
                    }

                    grouped[userId].answers[questionId] = {
                        selectedOption: ans.selectedOption?.toUpperCase() || '-',
                        isCorrect: ans.isCorrect,
                        correctOption: ans.questionId.correctOption?.toUpperCase() || '-'
                    };
                });

                const sortedQuestions = Array.from(questionMap.values());
                setQuestions(sortedQuestions);
                setGroupedResults(grouped);
            } catch (error) {
                console.error('Error fetching results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    if (loading) return <p>Loading results...</p>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Quiz Results</h2>
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Name</th>
                            <th className="border p-2">USN</th>
                            <th className="border p-2">College</th>
                            <th className="border p-2">Department</th>
                            <th className="border p-2">Email</th>
                            {questions.map((q) => (
                                <th key={q._id} className="border p-2 text-left">
                                    {q.text.length > 50 ? q.text.slice(0, 50) + '...' : q.text}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(groupedResults).map(({ user, answers }) => (
                            <tr key={user._id}>
                                <td className="border p-2">{user.fullname || '-'}</td>
                                <td className="border p-2">{user.usn || '-'}</td>
                                <td className="border p-2">{user.collegename || '-'}</td>
                                <td className="border p-2">{user.branch || '-'}</td>
                                <td className="border p-2">{user.email || '-'}</td>
                                {questions.map((q) => {
                                    const ans = answers[q._id];
                                    return (
                                        <td key={q._id} className="border p-2 text-center">
                                            {ans ? (
                                                <div>
                                                    <div className="font-semibold">{ans.selectedOption}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {ans.isCorrect ? '✅' : '❌'}
                                                    </div>
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ResultTable;
