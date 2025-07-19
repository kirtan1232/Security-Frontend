import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar.jsx";
import { FaCheckCircle, FaLock, FaGuitar, FaPlay, FaTrophy, FaStar, FaMusic } from "react-icons/fa";
import { useTheme } from "../../components/ThemeContext.jsx";
import Footer from "../../components/footer.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Lesson() {
  const { theme } = useTheme();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Guitar");
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(
          `https://localhost:3000/api/quiz/getquiz?instrument=${encodeURIComponent(selectedCategory.toLowerCase())}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        toast.error("Error fetching quizzes: " + error.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    const fetchCompletedLessons = async () => {
      try {
        const response = await fetch("https://localhost:3000/api/completed/getcompleted", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch completed lessons");
        }

        const data = await response.json();
        setCompletedLessons(data.completedLessons || []);
      } catch (error) {
        toast.error("Error fetching completed lessons: " + error.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await fetch("https://localhost:3000/api/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        toast.error("Error fetching user profile: " + error.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchQuizzes();
    fetchCompletedLessons();
    fetchUserProfile();
  }, [selectedCategory]);

  const filteredQuizzes = quizzes.filter((quiz) => quiz.instrument.toLowerCase() === selectedCategory.toLowerCase());
  const uniqueDays = [...new Set(filteredQuizzes.map((quiz) => quiz.day))].sort((a, b) => {
    const dayA = parseInt(a.replace("Day ", ""));
    const dayB = parseInt(b.replace("Day ", ""));
    return dayA - dayB;
  });
  const totalDays = uniqueDays.length;
  const completedDaysCount = uniqueDays.filter((day) =>
    completedLessons.some(
      (lesson) => lesson.day === day && lesson.instrument.toLowerCase() === selectedCategory.toLowerCase()
    )
  ).length;
  const completionPercentage = totalDays > 0 ? (completedDaysCount / totalDays) * 100 : 0;

  const isDayAccessible = (day) => {
    if (!day || uniqueDays.length === 0) return false;
    if (day === uniqueDays[0]) return true; // First day is always accessible
    const currentIndex = uniqueDays.indexOf(day);
    if (currentIndex === -1) return false;
    const previousDay = uniqueDays[currentIndex - 1];
    return completedLessons.some(
      (lesson) => lesson.day === previousDay && lesson.instrument.toLowerCase() === selectedCategory.toLowerCase()
    );
  };

  const handleDayClick = (day) => {
    if (!isDayAccessible(day)) {
      toast.warn("Complete the previous task first.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    navigate(`/lesson/${selectedCategory.toLowerCase()}/${day}`);
  };

  const isDayWrong = (day) => {
    return incorrectAnswers.some(
      (answer) => answer.day === day && answer.instrument.toLowerCase() === selectedCategory.toLowerCase()
    );
  };

  const isDayCompleted = (day) => {
    return completedLessons.some(
      (lesson) => lesson.day === day && lesson.instrument.toLowerCase() === selectedCategory.toLowerCase()
    );
  };

  const getInstrumentIcon = (instrument) => {
    switch (instrument) {
      case "Guitar":
        return <FaGuitar className="text-2xl" />;
      case "Piano":
        return <FaMusic className="text-2xl" />;
      case "Ukulele":
        return <FaGuitar className="text-2xl" />;
      default:
        return <FaMusic className="text-2xl" />;
    }
  };

  const getInstrumentGradient = (instrument) => {
    switch (instrument) {
      case "Guitar":
        return "from-orange-500 to-red-500";
      case "Piano":
        return "from-purple-500 to-pink-500";
      case "Ukulele":
        return "from-green-500 to-blue-500";
      default:
        return "from-blue-500 to-purple-500";
    }
  };

  useEffect(() => {
    if (completionPercentage === 100 && totalDays > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [completionPercentage, totalDays]);

  return (
    <div
      className={`flex flex-col min-h-screen ${
        theme === "light"
          ? "bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100"
          : "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800"
      }`}
    >
      <div className="relative flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 flex justify-center items-start mt-4">
          <div className="bg-white/70 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 w-full max-w-7xl h-[85vh] flex flex-col">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-4 animate-pulse">
                <FaPlay className="text-white text-2xl" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {selectedCategory} Lessons
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Master your {selectedCategory} knowledge
              </p>
            </div>

            {/* Instrument Selection */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-white/50 dark:bg-gray-700/50 rounded-2xl p-2 shadow-lg backdrop-blur-sm">
                {["Guitar", "Piano", "Ukulele"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category
                        ? `bg-gradient-to-r ${getInstrumentGradient(category)} text-white shadow-lg`
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                    }`}
                  >
                    <span className="mr-2">{getInstrumentIcon(category)}</span>
                    <span className="font-semibold">{category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Section */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700/30 dark:to-purple-900/20 rounded-2xl border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaTrophy className="text-yellow-500 text-2xl mr-3" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Progress Tracker
                  </h3>
                </div>
                {showCelebration && (
                  <div className="flex items-center animate-bounce">
                    <FaStar className="text-yellow-400 text-xl mr-1" />
                    <span className="text-lg font-bold text-yellow-600">All Complete! 🎉</span>
                  </div>
                )}
              </div>
              <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${completionPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {completedDaysCount} of {totalDays} days completed
                </span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
            </div>

            {/* Lessons Grid with Horizontal Scroll */}
            <div className="overflow-x-auto max-h-[calc(85vh-350px)] scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
              {uniqueDays.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                    <FaMusic className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-xl text-gray-500 dark:text-gray-400">
                    No lessons available for this instrument.
                  </p>
                </div>
              ) : (
                <div className="flex flex-row gap-4">
                  {uniqueDays.map((day, index) => {
                    const accessible = isDayAccessible(day);
                    const isCompleted = isDayCompleted(day);
                    const isWrong = isDayWrong(day);
                    const dayNumber = parseInt(day.replace("Day ", ""));

                    return (
                      <div
                        key={day}
                        className={`group relative p-6 rounded-3xl shadow-lg transition-all duration-300 transform hover:scale-105 min-w-[250px] ${
                          accessible
                            ? "bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-700/80 dark:to-gray-800/60 cursor-pointer hover:shadow-xl"
                            : "bg-gray-200/50 dark:bg-gray-700/30 cursor-not-allowed"
                        } ${
                          isCompleted && !isWrong
                            ? "border-2 border-green-400 dark:border-green-500"
                            : isWrong
                              ? "border-2 border-red-400 dark:border-red-500"
                              : accessible
                                ? "border-2 border-purple-300 dark:border-purple-600"
                                : "border-2 border-gray-300 dark:border-gray-600"
                        }`}
                        onClick={() => handleDayClick(day)}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        style={{
                          animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                        }}
                      >
                        {/* Day Number Badge */}
                        <div
                          className={`absolute -top-0 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            isCompleted && !isWrong
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : isWrong
                                ? "bg-gradient-to-r from-red-400 to-red-600"
                                : accessible
                                  ? "bg-gradient-to-r from-purple-400 to-purple-600"
                                  : "bg-gray-400"
                          }`}
                        >
                          {dayNumber}
                        </div>

                        {/* Content */}
                        <div className="flex items-center justify-between mb-4">
                          <h3
                            className={`text-xl font-bold transition-colors ${
                              accessible
                                ? "text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                                : "text-gray-500 dark:text-gray-500"
                            }`}
                          >
                            {day}
                          </h3>

                          {/* Status Icons */}
                          <div className="flex items-center space-x-2">
                            {isCompleted && !isWrong && (
                              <div className="relative">
                                <FaCheckCircle className="text-green-500 text-2xl animate-pulse" />
                                <div className="absolute inset-0 animate-ping">
                                  <FaCheckCircle className="text-green-400 text-2xl opacity-75" />
                                </div>
                              </div>
                            )}
                            {isWrong && (
                              <div className="relative">
                                <FaCheckCircle className="text-red-500 text-2xl animate-pulse" />
                                <div className="absolute inset-0 animate-ping">
                                  <FaCheckCircle className="text-red-400 text-2xl opacity-75" />
                                </div>
                              </div>
                            )}
                            {!accessible && (
                              <FaLock className="text-gray-400 text-xl" />
                            )}
                          </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-4">
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isCompleted && !isWrong
                                  ? "bg-gradient-to-r from-green-400 to-green-600 w-full"
                                  : isWrong
                                    ? "bg-gradient-to-r from-red-400 to-red-600 w-full"
                                    : accessible
                                      ? "bg-gradient-to-r from-purple-400 to-purple-600 w-1/3"
                                      : "bg-gray-400 w-0"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Action Text */}
                        <p
                          className={`text-sm font-medium ${
                            isCompleted && !isWrong
                              ? "text-green-600 dark:text-green-400"
                              : isWrong
                                ? "text-red-600 dark:text-red-400"
                                : accessible
                                  ? "text-purple-600 dark:text-purple-400"
                                  : "text-gray-500 dark:text-gray-500"
                          }`}
                        >
                          {isCompleted && !isWrong
                            ? "✓ Completed"
                            : isWrong
                              ? "✗ Review Needed"
                              : accessible
                                ? "Ready to learn"
                                : "Complete previous day first"}
                        </p>

                        {/* Hover Effect */}
                        {hoveredDay === day && accessible && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl pointer-events-none"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Enhanced Profile Picture */}
        <div className="absolute top-4 right-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full p-1">
              {userProfile && userProfile.profilePicture ? (
                <img
                  src={`https://localhost:3000/${userProfile.profilePicture}`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform duration-300"
                  onClick={() => navigate("/profile")}
                />
              ) : (
                <img
                  src="src/assets/images/profile.png"
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform duration-300"
                  onClick={() => navigate("/profile")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Custom CSS for animations and scrollbar */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }

        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }

        .scrollbar-thumb-purple-500::-webkit-scrollbar-thumb {
          background-color: #a855f7;
          border-radius: 9999px;
        }

        .scrollbar-track-gray-200::-webkit-scrollbar-track {
          background-color: #e5e7eb;
          border-radius: 9999px;
        }

        .dark .scrollbar-track-gray-700::-webkit-scrollbar-track {
          background-color: #374151;
        }
      `}</style>
    </div>
  );
}