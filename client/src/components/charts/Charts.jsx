import { useEffect, useState } from "react";
import { Chart } from "react-chartjs-2";
import axios from "axios";

export default function ScoreAnalysis() {
    const [scoreData, setScoreData] = useState([]);

    useEffect(() => {
        axios.get("/api/scores")
            .then(response => setScoreData(response.data))
            .catch(error => console.error("Error fetching scores:", error));
    }, []);

    const data = {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
            {
                label: "Scores",
                data: scoreData,
                backgroundColor: ["#4CAF50", "#FF5733", "#FFC300", "#3498DB"],
            },
        ],
    };

    return (
        <div className="p-10 max-w-screen-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Score Analysis</h2>
            <Chart type="bar" data={data} />
        </div>
    );
}