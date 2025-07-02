import { useNavigate } from "react-router-dom";
import quizImage from "../images/quiz.png";
import mondayImage from "../images/monday.jpg";
import wednesdayImage from "../images/wend.png";
import fridayImage from "../images/wend.png";
import { FiCalendar, FiClock, FiLock, FiZap, FiActivity, FiBarChart2 } from "react-icons/fi";

export default function Dashboard() {
    const navigate = useNavigate();

    const handleCardClick = (cardIndex, isActive) => {
        if (isActive) {
            navigate(`/dashboard/quiz?set=${cardIndex}`);
        }
    };

    const today = new Date();
    const currentDay = today.getDay();
    const currentDate = today.getDate();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // For July 2025 demonstration
    const july2025 = new Date(2025, 6, 1);
    const julyFirstDay = july2025.getDay();
    const julyWeek1Dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(july2025);
        date.setDate(i - julyFirstDay + 1);
        return date.getDate();
    }).filter(d => d > 0 && d <= 7);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthName = monthNames[currentMonth];

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const currentWeekOfMonth = Math.ceil((currentDate + firstDayOfMonth) / 7);

    const quizDays = [
        {
            day: 1,
            label: "Monday",
            title: "Monday Momentum",
            subtitle: "Jumpstart your week",
            image: mondayImage,
            color: "from-blue-500 to-blue-600",
            icon: <FiZap className="text-blue-500" />
        },
        {
            day: 3,
            label: "Wednesday",
            title: "Wisdom Wednesday",
            subtitle: "Midweek mind challenge",
            image: wednesdayImage,
            color: "from-purple-500 to-purple-600",
            icon: <FiActivity className="text-purple-500" />
        },
        {
            day: 5,
            label: "Friday",
            title: "Friday Finale",
            subtitle: "Weekend warm-up",
            image: fridayImage,
            color: "from-indigo-500 to-indigo-600",
            icon: <FiBarChart2 className="text-indigo-500" />
        }
    ];

    const getQuizStatus = () => {
        const sunday10PM = new Date(today);
        sunday10PM.setDate(today.getDate() + (7 - currentDay));
        sunday10PM.setHours(22, 0, 0, 0);
        return new Date() <= sunday10PM;
    };

    const quizzes = quizDays.map((quiz, index) => {
        const quizDate = new Date(today);
        const startOfWeek = today.getDate() - currentDay + quiz.day;
        quizDate.setDate(startOfWeek);

        return {
            ...quiz,
            key: index + 1,
            isActive: getQuizStatus(),
            date: quizDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        };
    });

    return (
        <div className="p-6 md:p-10 max-w-screen-lg mx-auto">
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Month Card - Neutral Style */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 w-full md:w-64 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white flex items-center justify-center">
                            <FiCalendar className="mr-2 text-gray-500 dark:text-gray-400" />
                            {currentMonthName} {currentYear}
                        </h2>
                    </div>

                    {/* Week Card - Neutral Style */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 w-full md:w-64 shadow-lg text-center border border-gray-200 dark:border-gray-700">
                        <span className="text-md font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center">
                            <FiClock className="mr-2 text-gray-500 dark:text-gray-400" />
                            Week {currentWeekOfMonth} of the Month
                        </span>
                    </div>
                </div>

                {/* July 2025 Week 1 Calendar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">July 2025 - Week 1</h3>
                    <div className="flex gap-2">
                        {julyWeek1Dates.map((date, i) => (
                            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
                                ${date === 1 ? "bg-blue-500 text-white font-bold shadow-md" :
                                    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
                                {date}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                    <div
                        key={quiz.key}
                        className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-[1.02] relative
                            ${quiz.isActive
                                ? "cursor-pointer hover:shadow-xl"
                                : "opacity-90 cursor-not-allowed grayscale-[30%]"
                            }`}
                        onClick={() => handleCardClick(quiz.key, quiz.isActive)}
                    >
                        {/* Gradient overlay */}
                        <div className={`absolute inset-0 ${quiz.color} opacity-20 z-0`}></div>

                        {/* Card content */}
                        <div className="relative h-48 border-b border-gray-200/50 dark:border-gray-700/50">
                            <img
                                src={quiz.image}
                                alt={quiz.label}
                                className="w-full h-full object-cover z-0"
                            />
                            <div className="absolute inset-0 bg-black/20 z-10"></div>
                            <div className="absolute bottom-4 left-4 z-20">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${quiz.isActive
                                    ? "bg-white/90 text-gray-800"
                                    : "bg-gray-300/90 text-gray-600"}`}>
                                    {quiz.label}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm p-5 border border-t-0 border-gray-200/50 dark:border-gray-700/50 rounded-b-xl relative z-10">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className={`text-2xl font-bold mb-1 flex items-center ${!quiz.isActive ? "text-gray-400" : "text-gray-800 dark:text-white"}`}>
                                        <span className="mr-2">{quiz.icon}</span>
                                        {quiz.title}
                                    </h2>
                                    <p className={`text-sm ${!quiz.isActive ? "text-gray-400" : "text-gray-600 dark:text-gray-300"}`}>
                                        {quiz.subtitle}
                                    </p>
                                </div>
                                {quiz.isActive && (
                                    <div className="bg-white dark:bg-gray-700 rounded-lg p-2 shadow-sm">
                                        {/* <img
                                            src={quizImage}
                                            alt="Quiz"
                                            className="w-10 h-10 object-contain opacity-90"
                                        /> */}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <p className={`text-xs ${!quiz.isActive ? "text-gray-400" : "text-gray-500 dark:text-gray-400"}`}>
                                    {quiz.date}
                                </p>
                                <div className={`text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center ${quiz.isActive
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                    }`}>
                                    {quiz.isActive ? (
                                        <>
                                            <FiClock className="mr-1" />
                                            Until Sun 10PM
                                        </>
                                    ) : (
                                        <>
                                            <FiLock className="mr-1" />
                                            Locked
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}