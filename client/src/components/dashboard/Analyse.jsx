import { useEffect, useState } from "react";
import axios from "axios";

const Analyse = ({ userId }) => {
    const [analysisData, setAnalysisData] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/quiz/analyse?user_id=${userId}&topic=General`)
            .then(res => setAnalysisData(res.data))
            .catch(err => console.error("❌ Error fetching analysis:", err.response ? err.response.data : err));
    }, [userId]);

    return (
        <div>
            <h2>📊 Analysis Report</h2>
            <table border="1" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ width: "10%" }}>Question #</th>
                        <th style={{ width: "60%" }}>Question</th>
                        <th style={{ width: "15%" }}>Correct Answer</th>
                        <th style={{ width: "15%" }}>Your Answer</th>
                    </tr>
                </thead>
                <tbody>
                    {analysisData.map((data, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{data.question_text}</td>
                            <td>{data.correct_answer}</td>
                            <td style={{ color: data.correct_answer === data.selected_option ? "green" : "red" }}>
                                {data.selected_option}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
};

export default Analyse;