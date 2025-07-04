import { useNavigate } from "react-router-dom";
import quizImage from "../images/quiz.png";
import mondayImage from "../images/monday.jpg";
import wednesdayImage from "../images/wend.png";
import fridayImage from "../images/friday.png";
import { FiCalendar, FiClock, FiLock, FiZap, FiActivity, FiBarChart2 } from "react-icons/fi";

export default function Dashboard() {
    const navigate = useNavigate();

    const handleCardClick = (cardIndex, isActive) => {
        if (isActive) {
            navigate(`/dashboard/quiz?set=${cardIndex}`);
        }
    };

    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const currentDate = today.getDate();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 (January) to 11 (December)

    // Get the first day of the current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Calculate current week of month (1-5)
    const currentWeekOfMonth = Math.ceil((currentDate + firstDayOfMonth) / 7);

    // Get month name
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthName = monthNames[currentMonth];

    // Calculate dates for the current week
    const getCurrentWeekDates = () => {
        const weekDates = [];
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Go to Sunday

        for (let i = 0; i < 7; i++) {
            const date = new Date(firstDayOfWeek);
            date.setDate(firstDayOfWeek.getDate() + i);
            weekDates.push(date.getDate());
        }

        return weekDates;
    };
    const currentWeekDates = getCurrentWeekDates();

    const quizDays = [
        {
            day: 1, // Monday
            label: "Monday",
            title: "Monday Momentum",
            subtitle: "Jumpstart your week",
            image: mondayImage,
            color: "blue-500",
            icon: <FiZap className="text-blue-500" />
        },
        {
            day: 3, // Wednesday
            label: "Wednesday",
            title: "Wisdom Wednesday",
            subtitle: "Midweek mind challenge",
            image: wednesdayImage,
            color: "purple-500",
            icon: <FiActivity className="text-purple-500" />
        },
        {
            day: 5, // Friday
            label: "Friday",
            title: "Friday Finale",
            subtitle: "Weekend warm-up",
            image: fridayImage,
            color: "indigo-500",
            icon: <FiBarChart2 className="text-indigo-500" />
        }
    ];

    const getQuizStatus = () => {
        const sunday10PM = new Date(today);
        sunday10PM.setDate(today.getDate() + (7 - currentDay)); // Next Sunday
        sunday10PM.setHours(22, 0, 0, 0); // Set to 10 PM
        return new Date() <= sunday10PM;
    };

    const quizzes = quizDays.map((quiz, index) => {
        const quizDate = new Date(today);
        const startOfWeek = today.getDate() - currentDay; // Sunday of current week
        quizDate.setDate(startOfWeek + quiz.day);

        return {
            ...quiz,
            key: index + 1,
            isActive: getQuizStatus(),
            date: quizDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            })
        };
    });

    return (
        <div className="p-6 md:p-10 max-w-screen-lg mx-auto">
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Month Card */}
                    <div className="bg-white rounded-xl p-4 w-full md:w-64 shadow-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-center flex items-center justify-center">
                            <FiCalendar className="mr-2 text-gray-500" />
                            {currentMonthName} {currentYear}
                        </h2>
                    </div>

                    {/* Week Card */}
                    <div className="bg-white rounded-xl p-3 w-full md:w-64 shadow-lg text-center border border-gray-200">
                        <span className="text-md font-medium text-gray-700 flex items-center justify-center">
                            <FiClock className="mr-2 text-gray-500" />
                            Week {currentWeekOfMonth} of {currentMonthName}
                        </span>
                    </div>
                </div>

                {/* Current Week Calendar */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        {currentMonthName} {currentYear} - Week {currentWeekOfMonth}
                    </h3>
                    <div className="flex gap-2">
                        {currentWeekDates.map((date, i) => {
                            const isCurrentDate = date === currentDate;
                            return (
                                <div
                                    key={i}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
                                        ${isCurrentDate
                                            ? "bg-blue-500 text-white font-bold shadow-md"
                                            : "bg-gray-100 text-gray-600"}`}
                                >
                                    {date}
                                </div>
                            );
                        })}
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
                                : "opacity-90 cursor-not-allowed"
                            }`}
                        onClick={() => handleCardClick(quiz.key, quiz.isActive)}
                    >
                        {/* Card content */}
                        <div className="relative h-48 border-b border-gray-200/50">
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

                        <div className="bg-white/80 backdrop-blur-sm p-5 border border-t-0 border-gray-200/50 rounded-b-xl relative z-10">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className={`text-2xl font-bold mb-1 flex items-center ${!quiz.isActive ? "text-gray-400" : "text-gray-800"}`}>
                                        <span className="mr-2">{quiz.icon}</span>
                                        {quiz.title}
                                    </h2>
                                    <p className={`text-sm ${!quiz.isActive ? "text-gray-400" : "text-gray-600"}`}>
                                        {quiz.subtitle}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <p className={`text-xs ${!quiz.isActive ? "text-gray-400" : "text-gray-500"}`}>
                                    {quiz.date}
                                </p>
                                <div className={`text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center ${quiz.isActive
                                    ? `bg-${quiz.color}/10 text-${quiz.color}-800`
                                    : "bg-gray-200 text-gray-600"
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