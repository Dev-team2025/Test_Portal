import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';

function getCurrentWeekSets(totalSets = 52) {
    const now = moment();
    const weekOfYear = now.isoWeek();
    const startSet = ((weekOfYear - 1) * 3) % totalSets + 1;
    return [
        startSet,
        startSet % totalSets + 1,
        (startSet + 1) % totalSets + 1
    ].map(set => (set > totalSets ? set - totalSets : set));
}

function ResultTable() {
    const [groupedResults, setGroupedResults] = useState({});
    const [filteredResults, setFilteredResults] = useState({});
    const [questionDetails, setQuestionDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSet, setSelectedSet] = useState(null);
    const [currentWeekSets, setCurrentWeekSets] = useState([]);
    const [collegeList, setCollegeList] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState("All");

    useEffect(() => {
        const sets = getCurrentWeekSets();
        setCurrentWeekSets(sets);
        setSelectedSet(sets[0]);
    }, []);

    useEffect(() => {
        if (!selectedSet) return;

        const fetchResults = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/result/all`);
                const answers = response.data.answers || [];

                const grouped = {};
                const questionMap = new Map();
                const collegeSet = new Set();

                answers.forEach((ans) => {
                    const userId = ans.userId?._id;
                    const question = ans.questionId;

                    if (
                        !userId ||
                        !question?._id ||
                        ans.setNumber !== question.set ||
                        ans.setNumber !== selectedSet
                    ) {
                        return;
                    }

                    const college = ans.userId?.collegename?.trim();
                    if (college) collegeSet.add(college);

                    const qid = question._id;
                    if (!questionMap.has(qid)) {
                        questionMap.set(qid, {
                            _id: qid,
                            text: question.question,
                            order: question.set
                        });
                    }

                    if (!grouped[userId]) {
                        grouped[userId] = {
                            user: ans.userId,
                            answers: {}
                        };
                    }

                    grouped[userId].answers[qid] = {
                        selectedOption: ans.selectedOption?.toUpperCase() || '-',
                        isCorrect: ans.isCorrect
                    };
                });

                const sortedQuestions = Array.from(questionMap.values()).sort((a, b) =>
                    a.text.localeCompare(b.text)
                );

                const sortedColleges = Array.from(collegeSet).sort();

                setQuestionDetails(sortedQuestions);
                setGroupedResults(grouped);
                setCollegeList(sortedColleges);
                setSelectedCollege("All");
            } catch (error) {
                console.error('Error fetching results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [selectedSet]);

    useEffect(() => {
        if (selectedCollege === "All") {
            setFilteredResults(groupedResults);
        } else {
            const filtered = {};
            for (const [uid, data] of Object.entries(groupedResults)) {
                if (data.user.collegename === selectedCollege) {
                    filtered[uid] = data;
                }
            }
            setFilteredResults(filtered);
        }
    }, [selectedCollege, groupedResults]);

    if (loading) return <p>Loading results...</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Weekly Quiz Results</h2>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap mb-4">
                {/* Set Filter */}
                <div>
                    <label htmlFor="set-select" className="mr-2 font-medium">Select Quiz Set:</label>
                    <select
                        id="set-select"
                        value={selectedSet}
                        onChange={(e) => setSelectedSet(Number(e.target.value))}
                        className="border border-gray-300 rounded p-2"
                    >
                        {currentWeekSets.map((set) => (
                            <option key={set} value={set}>Set {set}</option>
                        ))}
                    </select>
                </div>

                {/* College Filter */}
                <div>
                    <label htmlFor="college-select" className="mr-2 font-medium">Filter by College:</label>
                    <select
                        id="college-select"
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        className="border border-gray-300 rounded p-2"
                    >
                        <option value="All">All</option>
                        {collegeList.map((college) => (
                            <option key={college} value={college}>{college}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Name</th>
                            <th className="border p-2">USN</th>
                            <th className="border p-2">College</th>
                            <th className="border p-2">Department</th>
                            <th className="border p-2">Email</th>
                            {questionDetails.map((q) => (
                                <th key={q._id} className="border p-2 text-left min-w-[200px]">
                                    {q.text}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(filteredResults).map(({ user, answers }) => (
                            <tr key={user._id}>
                                <td className="border p-2">{user.fullname || '-'}</td>
                                <td className="border p-2">{user.usn || '-'}</td>
                                <td className="border p-2">{user.collegename || '-'}</td>
                                <td className="border p-2">{user.branch || '-'}</td>
                                <td className="border p-2">{user.email || '-'}</td>
                                {questionDetails.map((q) => {
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
