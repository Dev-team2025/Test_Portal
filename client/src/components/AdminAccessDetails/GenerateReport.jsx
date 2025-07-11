import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileDown, School, FileSpreadsheet, LoaderCircle } from 'lucide-react';

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
  const [questionDetails, setQuestionDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState(null);
  const [currentWeekSets, setCurrentWeekSets] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [allColleges, setAllColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');

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
        const marks = response.data.marksMap || {};

        setMarksMap(marks);

        const grouped = {};
        const questionMap = new Map();

        answers.forEach((ans) => {
          const userId = ans.userId?._id;
          const question = ans.questionId;

          if (!userId || !question?._id || ans.setNumber !== question.set || ans.setNumber !== selectedSet) return;

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

        const colleges = new Set();
        Object.values(grouped).forEach(({ user }) => {
          if (user.collegename) colleges.add(user.collegename);
        });

        setAllColleges(Array.from(colleges).sort());
        setQuestionDetails(sortedQuestions);
        setGroupedResults(grouped);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedSet]);

  const filteredResults = selectedCollege
    ? Object.values(groupedResults).filter(({ user }) => user.collegename === selectedCollege)
    : Object.values(groupedResults);

  const handleDownloadExcel = () => {
    const headers = [
      'Name', 'USN', 'College', 'Department', 'Email', 'Total Marks',
      ...questionDetails.map(q => q.text)
    ];

    const data = filteredResults.map(({ user, answers }) => {
      const row = [
        user.fullname || '-', user.usn || '-', user.collegename || '-',
        user.branch || '-', user.email || '-', marksMap[`${user._id}_${selectedSet}`] ?? '-'
      ];

      questionDetails.forEach((q) => {
        const ans = answers[q._id];
        row.push(ans ? `${ans.selectedOption} (${ans.isCorrect ? 'Correct' : 'Wrong'})` : '-');
      });

      return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Set_${selectedSet}`);

    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const filename = `Quiz_Results_Set${selectedSet}_${timestamp}.xlsx`;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-600 gap-2">
        <LoaderCircle className="animate-spin" />
        <span>Loading results...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileSpreadsheet className="text-green-700" /> Weekly Test Report
      </h2>

      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="set-select" className="font-medium">Set:</label>
          <select
            id="set-select"
            value={selectedSet}
            onChange={(e) => setSelectedSet(Number(e.target.value))}
            className="border border-gray-300 rounded p-2"
          >
            {currentWeekSets.map((set) => (
              <option key={set} value={set}>Card {set}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="college-select" className="font-medium flex items-center gap-1">
            <School className="w-4 h-4" /> College:
          </label>
          <select
            id="college-select"
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="">All Colleges</option>
            {allColleges.map(college => (
              <option key={college} value={college}>{college}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleDownloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Download Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">USN</th>
              <th className="border p-2">College</th>
              <th className="border p-2">Department</th>
              <th className="border p-2">Email</th>
              <th className="border p-2 text-green-700">Total Marks</th>
              {questionDetails.map((q) => (
                <th key={q._id} className="border p-2 min-w-[200px]">{q.text}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredResults.map(({ user, answers }) => (
              <tr key={user._id}>
                <td className="border p-2">{user.fullname || '-'}</td>
                <td className="border p-2">{user.usn || '-'}</td>
                <td className="border p-2">{user.collegename || '-'}</td>
                <td className="border p-2">{user.branch || '-'}</td>
                <td className="border p-2">{user.email || '-'}</td>
                <td className="border p-2 text-center font-bold text-green-700">
                  {marksMap[`${user._id}_${selectedSet}`] ?? '-'}
                </td>
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
                      ) : '-'}
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
