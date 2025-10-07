import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileSpreadsheet,
  LoaderCircle,
  FileDown,
  School,
  FileText,
  FileType2,
  X
} from 'lucide-react';

// Calculate current week sets based on October start
function getCurrentWeekSets(totalSets = 52) {
  const now = moment();
  const startOfYear =
    now.month() >= 9
      ? moment([now.year(), 9, 1]) // Oct this year
      : moment([now.year() - 1, 9, 1]); // Oct last year

  const weekOfYear = Math.floor(now.diff(startOfYear, "weeks")) + 1;

  const startSet = ((weekOfYear - 1) * 3) % totalSets + 1;

  return [
    startSet,
    (startSet % totalSets) + 1,
    ((startSet + 1) % totalSets) + 1
  ].map(set => (set > totalSets ? set - totalSets : set));
}

function ResultTable() {
  const [currentWeekSets, setCurrentWeekSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [groupedResults, setGroupedResults] = useState({});
  const [questionDetails, setQuestionDetails] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [allColleges, setAllColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const itemsPerPage = 10;

  // Initialize week sets
  useEffect(() => {
    const sets = getCurrentWeekSets();
    setCurrentWeekSets(sets);
    setSelectedSet(sets[0]);
  }, []);

  // Fetch results for selected set
  useEffect(() => {
    if (!selectedSet) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        // Fetch all answers for the selected set
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/result/all`);
        const answers = response.data.answers || [];
        const marks = response.data.marksMap || {};
        setMarksMap(marks);

        const grouped = {};
        const questionMap = new Map();

        answers.forEach(ans => {
          const user = ans.userId;
          const question = ans.questionId;

          if (!user || !question || ans.setNumber !== selectedSet) return;

          const qid = question._id;

          if (!questionMap.has(qid)) {
            questionMap.set(qid, {
              _id: qid,
              text: question.question,
              set: question.set
            });
          }

          if (!grouped[user._id]) {
            grouped[user._id] = {
              user,
              answers: {}
            };
          }

          grouped[user._id].answers[qid] = {
            selectedOption: ans.selectedOption?.toUpperCase() || '-',
            isCorrect: ans.isCorrect
          };
        });

        setGroupedResults(grouped);
        setQuestionDetails(Array.from(questionMap.values()).sort((a, b) =>
          a.text.localeCompare(b.text)
        ));

        const colleges = new Set();
        Object.values(grouped).forEach(({ user }) => {
          if (user.collegename) colleges.add(user.collegename);
        });
        setAllColleges(Array.from(colleges).sort());
        setPage(1);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedSet]);

  const filteredResults = selectedCollege
    ? Object.values(groupedResults).filter(({ user }) => user.collegename === selectedCollege)
    : Object.values(groupedResults);

  const paginatedResults = filteredResults.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const generatePreviewData = (type) => {
    const headers = ['Name', 'USN', 'College', 'Department', 'Email', 'Total Marks', ...questionDetails.map(q => q.text)];
    const data = filteredResults.slice(0, 5).map(({ user, answers }) => {
      const row = [
        user.fullname || '-',
        user.usn || '-',
        user.collegename || '-',
        user.branch || '-',
        user.email || '-',
        marksMap[`${user._id}_${selectedSet}`] ?? '-'
      ];
      questionDetails.forEach(q => {
        const ans = answers[q._id];
        row.push(ans ? `${ans.selectedOption} (${ans.isCorrect ? 'Correct' : 'Wrong'})` : '-');
      });
      return row;
    });
    setPreviewData([headers, ...data]);
    setPreviewType(type);
    setShowPreview(true);
  };

  const handleExportExcel = () => {
    const headers = ['Name', 'USN', 'College', 'Department', 'Email', 'Total Marks', ...questionDetails.map(q => q.text)];
    const data = filteredResults.map(({ user, answers }) => {
      const row = [
        user.fullname || '-',
        user.usn || '-',
        user.collegename || '-',
        user.branch || '-',
        user.email || '-',
        marksMap[`${user._id}_${selectedSet}`] ?? '-'
      ];
      questionDetails.forEach(q => {
        const ans = answers[q._id];
        row.push(ans ? `${ans.selectedOption} (${ans.isCorrect ? 'Correct' : 'Wrong'})` : '-');
      });
      return row;
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Set_${selectedSet}`);
    const ts = moment().format('YYYY-MM-DD_HH-mm-ss');
    const filename = `Quiz_Results_Set${selectedSet}_${ts}.xlsx`;
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), filename);
    setShowPreview(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text(`Quiz Report - Set ${selectedSet}`, 14, 14);
    const headers = ['Name', 'USN', 'College', 'Department', 'Email', 'Total'];
    const body = filteredResults.map(({ user }) => [
      user.fullname || '-',
      user.usn || '-',
      user.collegename || '-',
      user.branch || '-',
      user.email || '-',
      marksMap[`${user._id}_${selectedSet}`] ?? '-'
    ]);

    autoTable(doc, {
      head: [headers],
      body,
      startY: 20,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    const ts = moment().format('YYYY-MM-DD_HH-mm-ss');
    doc.save(`Quiz_Results_Set${selectedSet}_${ts}.pdf`);
    setShowPreview(false);
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
          <label className="font-medium">Set:</label>
          <select
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
          <label className="font-medium flex items-center gap-1">
            <School className="w-4 h-4" /> College:
          </label>
          <select
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

        <div className="relative group">
          <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition">
            <FileDown className="w-4 h-4" /> Download
          </button>
          <div className="absolute z-10 hidden group-hover:block bg-white border mt-1 rounded shadow-md">
            <button
              onClick={() => generatePreviewData('excel')}
              className="px-4 py-2 text-sm w-full hover:bg-gray-100 flex items-center gap-2"
            >
              <FileType2 className="w-4 h-4 text-green-600" /> Excel
            </button>
            <button
              onClick={() => generatePreviewData('pdf')}
              className="px-4 py-2 text-sm w-full hover:bg-gray-100 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-red-600" /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[70vh] mt-20">
        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border p-2 bg-white">Name</th>
              <th className="border p-2 bg-white">USN</th>
              <th className="border p-2 bg-white">College</th>
              <th className="border p-2 bg-white">Department</th>
              <th className="border p-2 bg-white">Email</th>
              <th className="border p-2 text-green-700 bg-white">Total Marks</th>
              {questionDetails.map((q) => (
                <th key={q._id} className="border p-2 bg-white min-w-[200px]">{q.text}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedResults.map(({ user, answers }) => (
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
                          <div className="text-xs text-gray-500">{ans.isCorrect ? '✅' : '❌'}</div>
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

      <div className="flex justify-center mt-4 gap-2">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <span className="px-3 py-1">{page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-bold">
                {previewType === 'excel' ? 'Excel Preview' : 'PDF Preview'} (First 5 records)
              </h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4">
              {previewType === 'excel' ? (
                <div className="overflow-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr className="bg-gray-100">
                        {previewData[0]?.map((header, i) => <th key={i} className="border p-2 text-left">{header}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(1).map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => <td key={j} className="border p-2">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-auto">
                  <div className="mb-4 font-bold">Quiz Report - Set {selectedSet}</div>
                  <table className="min-w-full border text-xs">
                    <thead>
                      <tr className="bg-green-100">
                        {['Name', 'USN', 'College', 'Department', 'Email', 'Total'].map((header, i) => (
                          <th key={i} className="border p-1 text-left">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.slice(0, 5).map(({ user }) => (
                        <tr key={user._id}>
                          <td className="border p-1">{user.fullname || '-'}</td>
                          <td className="border p-1">{user.usn || '-'}</td>
                          <td className="border p-1">{user.collegename || '-'}</td>
                          <td className="border p-1">{user.branch || '-'}</td>
                          <td className="border p-1">{user.email || '-'}</td>
                          <td className="border p-1 font-bold text-green-700">{marksMap[`${user._id}_${selectedSet}`] ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowPreview(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
              <button onClick={previewType === 'excel' ? handleExportExcel : handleExportPDF} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Download {previewType === 'excel' ? 'Excel' : 'PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultTable;
