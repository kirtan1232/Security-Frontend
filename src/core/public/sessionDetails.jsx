import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/sidebar.jsx";
import { FaCheckCircle, FaPlay, FaClock, FaBook } from "react-icons/fa";
import { useTheme } from "../../components/ThemeContext";
import Footer from "../../components/footer.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SessionDetails() {
  const { theme } = useTheme();
  const { day, instrument } = useParams();
  const [sessions, setSessions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [canMarkComplete, setCanMarkComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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

    const fetchSessions = async () => {
      try {
        const response = await fetch(`https://localhost:3000/api/sessions`);
        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }
        const data = await response.json();
        const filtered = data.filter((session) => session.day === day && session.instrument === instrument);
        setSessions(filtered);
        if (filtered.length > 0) {
          setTimeLeft(filtered[0].duration * 60);
          fetchCompletionStatus();
        }
      } catch (error) {
        toast.error("Error fetching sessions: " + error.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    const fetchCompletionStatus = async () => {
      try {
        const response = await fetch("https://localhost:3000/api/completed-sessions/getcompleted", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch completion status");
        }
        const data = await response.json();
        const isCompleted = data.completedSessions.some(
          (s) => s.day === day && s.instrument === instrument
        );
        setCompleted(isCompleted);
      } catch (error) {
        toast.error("Error fetching completion status: " + error.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchUserProfile();
    fetchSessions();
  }, [day, instrument]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanMarkComplete(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    const match = url.match(/(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=))([^&\n]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const markAsComplete = async () => {
    if (!canMarkComplete) {
      toast.warn("Finish the practice first.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await fetch("https://localhost:3000/api/completed-sessions/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ day, instrument }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark session as complete");
      }

      const data = await response.json();
      setCompleted(!completed);
      setShowCompleteAnimation(true);
      setTimeout(() => setShowCompleteAnimation(false), 2000);
      toast.success("Session completion toggled!", {
        position: "top-right",
        autoClose: 1500,
      });
    } catch (error) {
      toast.error("Error marking session as complete: " + error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className={`bg-gradient-to-br min-h-screen flex flex-col ${theme === 'light' ? 'from-purple-100 via-blue-100 to-pink-100' : 'from-gray-900 via-purple-900 to-gray-800'} fallback:bg-gray-900`}>
      <div className="relative flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 flex justify-center items-start mt-4">
          <div className="bg-white/70 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 w-full max-w-7xl h-[85vh] overflow-y-auto">
            {/* Header with enhanced styling */}
            <header className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-4">
                <FaPlay className="text-white text-xl" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Practice Session
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {day} • {instrument}
              </p>
            </header>

            <div className="space-y-6">
              {sessions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                    <FaBook className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-xl text-gray-500 dark:text-gray-400">No sessions available.</p>
                </div>
              ) : (
                sessions.map((session, index) => (
                  <div
                    key={session._id}
                    className="group relative p-6 bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-700/80 dark:to-gray-800/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/30 dark:border-gray-600/30"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Session Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {session.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {session.description}
                        </p>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        <FaClock className="mr-1" />
                        {session.duration} min
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-600/30 dark:to-purple-900/20 rounded-xl border-l-4 border-purple-500">
                      <div className="flex items-center mb-2">
                        <FaBook className="text-purple-500 mr-2" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Instructions:</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {session.instructions}
                      </p>
                    </div>

                    {/* Video Section */}
                    {session.file && (
                      <div className="mb-6">
                        <div className="relative overflow-hidden rounded-xl shadow-lg">
                          <iframe
                            src={getYouTubeEmbedUrl(session.file)}
                            frameBorder="0"
                            width="100%"
                            height="300"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Video Preview"
                            className="rounded-xl"
                          ></iframe>
                        </div>
                      </div>
                    )}

                    {/* Completion Status */}
                    <div className="flex items-center justify-between">
                      {completed ? (
                        <div className={`flex items-center text-green-600 dark:text-green-400 ${showCompleteAnimation ? 'animate-bounce' : ''}`}>
                          <div className="relative">
                            <FaCheckCircle className="text-2xl mr-3" />
                            {showCompleteAnimation && (
                              <div className="absolute inset-0 animate-ping">
                                <FaCheckCircle className="text-2xl text-green-400 opacity-75" />
                              </div>
                            )}
                          </div>
                          <span className="text-lg font-semibold">Session Completed! 🎉</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          {/* Timer Display */}
                          <div className="flex items-center">
                            <div className={`flex items-center px-4 py-2 rounded-full ${timeLeft > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}`}>
                              <FaClock className="mr-2" />
                              <span className="font-mono text-lg font-bold">
                                {timeLeft > 0 ? formatTime(timeLeft) : "Ready!"}
                              </span>
                            </div>
                          </div>

                          {/* Complete Button */}
                          <button
                            onClick={markAsComplete}
                            disabled={!canMarkComplete}
                            className={`relative overflow-hidden px-8 py-3 rounded-full font-bold text-white transition-all duration-500 transform hover:scale-105 ${
                              canMarkComplete
                                ? "bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-400 hover:via-blue-400 hover:to-purple-500 shadow-lg hover:shadow-xl"
                                : "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <span className="relative z-10">
                              {canMarkComplete ? "Mark as Complete ✓" : `Practice for ${formatTime(timeLeft)}`}
                            </span>
                            {canMarkComplete && (
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
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
                  src="/profile.png"
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

      {/* Custom CSS for animations */}
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
        
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}