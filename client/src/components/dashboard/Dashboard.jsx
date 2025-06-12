import { useNavigate } from "react-router-dom";
import quizImage from "../images/quiz.png";

export default function Dashboard() {
    const navigate = useNavigate();

    const handleCardClick = (quizKey, isActive) => {
        if (isActive) {
            navigate(`/dashboard/quiz?set=${quizKey}`);
        }
    };

    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const currentDate = today.getDate();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthName = monthNames[currentMonth];

    // 🗓️ Calculate current week of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const currentWeekOfMonth = Math.ceil((currentDate + firstDayOfMonth) / 7);

    // Quiz Days: Monday (1), Wednesday (3), Friday (5)
    const quizDays = [
        { day: 1, label: "Monday" },
        { day: 3, label: "Wednesday" },
        { day: 5, label: "Friday" }
    ];

    // 🕙 Allow quizzes until Sunday 10 PM of this week
    const getQuizStatus = () => {
        const sunday10PM = new Date(today);
        sunday10PM.setDate(today.getDate() + (7 - currentDay));
        sunday10PM.setHours(22, 0, 0, 0);
        return new Date() <= sunday10PM;
    };

    const quizzes = quizDays.map(({ day, label }) => {
        const quizDate = new Date(today);
        const startOfWeek = today.getDate() - currentDay + day;
        quizDate.setDate(startOfWeek); // Always get this week's Monday/Wed/Fri

        return {
            key: `${currentYear}-${currentMonth + 1}-${quizDate.getDate()}`,
            label,
            isActive: getQuizStatus(),
            date: quizDate.toDateString()
        };
    });

    return (
        <div className="p-10 max-w-screen-lg mx-auto">
            <div className="mb-8">
                {/* Month & Year Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-4 w-64 shadow-lg mb-4">
                    <h2 className="text-xl font-semibold text-center">
                        {currentMonthName} {currentYear}
                    </h2>
                </div>

                {/* Current Week Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-2 w-64 shadow-md text-center">
                    <span className="text-md font-medium">📅 Week {currentWeekOfMonth} of the Month</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center">
                {quizzes.map((quiz) => (
                    <div
                        key={quiz.key}
                        className={`rounded-2xl shadow-lg p-6 w-72 flex flex-col items-center text-center transition duration-300 
                            ${quiz.isActive
                                ? "bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        onClick={() => handleCardClick(quiz.key, quiz.isActive)}
                    >
                        <img
                            src={quizImage}
                            alt="Quiz"
                            className={`w-32 h-32 object-cover rounded-lg mb-4 ${!quiz.isActive ? "opacity-50" : ""}`}
                        />
                        <h2 className={`text-xl font-bold mb-2 ${!quiz.isActive ? "text-gray-500" : "text-gray-900"}`}>
                            {quiz.label} Test
                        </h2>
                        <p className={!quiz.isActive ? "text-sm text-red-500 font-semibold" : "text-gray-900"}>
                            {quiz.isActive ? "🟢 Test Available until Sunday 10 PM" : "🔒 Test Locked"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
