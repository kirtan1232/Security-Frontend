import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar.jsx";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Award, Sparkles } from "lucide-react";
import { useTheme } from "../../components/ThemeContext.jsx";
import Footer from "../../components/footer.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LessonDetails() {
  const { theme } = useTheme();
  const { day, instrument } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [correctSound] = useState(new Audio("/src/assets/audio/true.mp3"));
  const [incorrectSound] = useState(new Audio("/src/assets/audio/false.mp3"));
  const [completedSound] = useState(new Audio("/src/assets/audio/completed.mp3"));
  const [showCompletionGif, setShowCompletionGif] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

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
        console.error("Error fetching user profile:", error);
        toast.error("Error fetching user profile: " + error.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    const fetchQuizzes = async () => {
      try {
        const response = await fetch(
          `https://localhost:3000/api/quiz/getquiz?day=${encodeURIComponent(day)}&instrument=${encodeURIComponent(
            instrument
          )}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }
        const data = await response.json();
        console.log("Fetched quiz data:", data);

        if (data.length > 0) {
          const allQuizzes = data.flatMap((quiz) => quiz.quizzes);
          setQuizzes(allQuizzes);
        } else {
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast.error("Error fetching quizzes: " + error.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchUserProfile();
    fetchQuizzes();
  }, [day, instrument]);

  const handleOptionClick = (option, correctAnswer) => {
    const correct = option === correctAnswer;
    setIsCorrect(correct);
    setFeedbackMessage(correct ? "Correct!" : "Incorrect answer!");
    setShowFeedback(true);

    if (correct) {
      correctSound.play().catch((error) => console.error("Error playing correct sound:", error));
    } else {
      incorrectSound.play().catch((error) => console.error("Error playing incorrect sound:", error));
    }

    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentIndex] = { answer: option, correct: correct };
    setSelectedAnswers(updatedAnswers);

    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  const nextQuiz = () => {
    if (!selectedAnswers[currentIndex] || !selectedAnswers[currentIndex].correct) {
      toast.error("Please select the correct answer to go to the next question.", {
        position: "top-right",
        autoClose: 3000,
      });
      incorrectSound.play().catch((error) => console.error("Error playing incorrect sound:", error));
      return;
    }

    if (currentIndex < quizzes.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        resetState();
        setIsTransitioning(false);
      }, 300);
    }
  };

  const prevQuiz = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        resetState();
        setIsTransitioning(false);
      }, 300);
    }
  };

  const resetState = () => {
    setIsCorrect(null);
    setFeedbackMessage("");
    setShowFeedback(false);
  };

  const handleSubmit = async () => {
    const hasIncorrectAnswers = selectedAnswers.some((answer) => answer && !answer.correct);
    if (hasIncorrectAnswers || selectedAnswers.length < quizzes.length) {
      toast.error("Please answer all questions correctly before submitting.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await fetch("https://localhost:3000/api/completed/addcompleted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ day, instrument }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark lesson as completed");
      }

      setShowCompletionGif(true);
      completedSound.play().catch((error) => console.error("Error playing completed sound:", error));
      
      toast.success("Lesson completed successfully!", {
        position: "top-right",
        autoClose: 1500,
      });

      setTimeout(() => {
        setShowCompletionGif(false);
        navigate("/lesson");
      }, 3500);
    } catch (error) {
      toast.error("Error marking lesson as completed: " + error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const progressPercentage = ((currentIndex + 1) / quizzes.length) * 100;

  return (
    <div
      className={`bg-gradient-to-br min-h-screen flex flex-col relative overflow-hidden ${
        theme === "light" ? "from-purple-100 via-blue-50 to-indigo-100" : "from-gray-900 via-gray-800 to-gray-900"
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="relative flex flex-1 z-10">
        <Sidebar />
        <main className="flex-1 p-6 flex justify-center items-start mt-4">
          <div className="bg-white/70 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 w-full max-w-7xl h-[85vh] transform transition-all duration-500 hover:shadow-3xl">
            {quizzes.length > 0 ? (
              <div className="flex flex-col h-full">
                {/* Header with progress */}
                <header className="mb-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {day} - {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Progress: {Math.round(progressPercentage)}%</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-700 ease-out relative"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </header>
                
                <div className={`flex flex-col lg:flex-row gap-8 flex-grow transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                  {/* Left side - Image */}
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="relative group">
                      {quizzes[currentIndex].chordDiagram ? (
                        <img
                          src={`https://localhost:3000/uploads/${quizzes[currentIndex].chordDiagram}`}
                          alt="Quiz Diagram"
                          className="w-full h-full max-h-[500px] object-contain rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl"
                          onError={(e) => {
                            console.error("Error loading image:", e.target.src);
                            e.target.src = "/assets/images/placeholder.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full max-h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center border border-white/20 dark:border-gray-700/30">
                          <p className="text-2xl text-gray-400 dark:text-gray-500">No image available</p>
                        </div>
                      )}
                      {/* Decorative elements */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-70 animate-bounce"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-70 animate-bounce delay-500"></div>
                    </div>
                  </div>

                  {/* Right side - Question and options */}
                  <div className="flex-1 flex flex-col space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full">
                          Question {currentIndex + 1} of {quizzes.length}
                        </span>
                        {selectedAnswers[currentIndex]?.correct && (
                          <CheckCircle className="w-6 h-6 text-green-500 animate-pulse" />
                        )}
                      </div>
                      
                      <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 leading-tight">
                        {quizzes[currentIndex].question}
                      </h3>

                      <div className="space-y-4">
                        {quizzes[currentIndex].options.map((option, i) => {
                          const selectedAnswer = selectedAnswers[currentIndex];
                          const isSelected = selectedAnswer?.answer === option;
                          const isCorrectOption = selectedAnswer?.correct && isSelected;
                          const isIncorrectOption = selectedAnswer && !selectedAnswer.correct && isSelected;
                          
                          return (
                            <div
                              key={i}
                              onClick={() => handleOptionClick(option, quizzes[currentIndex].correctAnswer)}
                              className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 text-lg font-medium transform hover:scale-[1.02] hover:shadow-lg
                                ${
                                  isCorrectOption
                                    ? "bg-gradient-to-r from-green-100 to-green-200 border-green-400 text-green-800 dark:from-green-900 dark:to-green-800 dark:border-green-500 dark:text-green-200 shadow-green-200 dark:shadow-green-800"
                                    : isIncorrectOption
                                    ? "bg-gradient-to-r from-red-100 to-red-200 border-red-400 text-red-800 dark:from-red-900 dark:to-red-800 dark:border-red-500 dark:text-red-200 shadow-red-200 dark:shadow-red-800"
                                    : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 hover:from-gray-100 hover:to-gray-200 dark:from-gray-700 dark:to-gray-600 dark:border-gray-500 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-800 dark:text-gray-200"
                                }`}
                            >
                              {/* Option indicator */}
                              <div className={`absolute -left-2 -top-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                                ${isCorrectOption ? 'bg-green-500 text-white' : isIncorrectOption ? 'bg-red-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 group-hover:bg-gray-400 dark:group-hover:bg-gray-500'}`}>
                                {String.fromCharCode(65 + i)}
                              </div>
                              
                              {/* Option text */}
                              <div className="ml-4">
                                {option}
                              </div>
                              
                              {/* Correct/Incorrect icons */}
                              {isCorrectOption && (
                                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-600 animate-bounce" />
                              )}
                              {isIncorrectOption && (
                                <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-red-600 animate-bounce" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Feedback message */}
                      {showFeedback && feedbackMessage && (
                        <div className={`text-center p-4 rounded-2xl font-bold text-xl transition-all duration-500 transform ${
                          showFeedback ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        } ${
                          isCorrect 
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200" 
                            : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200"
                        }`}>
                          <div className="flex items-center justify-center space-x-2">
                            {isCorrect ? (
                              <CheckCircle className="w-6 h-6 animate-pulse" />
                            ) : (
                              <XCircle className="w-6 h-6 animate-pulse" />
                            )}
                            <span>{feedbackMessage}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={prevQuiz}
                        disabled={currentIndex === 0}
                        className="group flex items-center px-8 py-4 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 dark:from-gray-600 dark:to-gray-500 dark:hover:from-gray-500 dark:hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                      >
                        <ChevronLeft size={24} className="mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                        Previous
                      </button>
                      
                      {currentIndex === quizzes.length - 1 ? (
                        <button
                          onClick={handleSubmit}
                          className="group flex items-center px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-lg font-semibold transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <Award className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                          Complete Lesson
                        </button>
                      ) : (
                        <button
                          onClick={nextQuiz}
                          disabled={currentIndex === quizzes.length - 1}
                          className="group flex items-center px-8 py-4 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 dark:from-gray-600 dark:to-gray-500 dark:hover:from-gray-500 dark:hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                        >
                          Next
                          <ChevronRight size={24} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-12 h-12 text-gray-600 animate-pulse" />
                  </div>
                  <p className="text-2xl text-gray-500 dark:text-gray-400">
                    No quizzes available for this lesson
                  </p>
                  <p className="text-lg text-gray-400 dark:text-gray-500">
                    Check back later for new content!
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Profile picture */}
        <div className="absolute top-4 right-4 group">
          <div className="bg-white/70 backdrop-blur-xl dark:bg-gray-800/80 rounded-full p-2 shadow-lg border border-white/20 dark:border-gray-700/30 transition-all duration-300 hover:shadow-xl">
            {userProfile && userProfile.profilePicture ? (
              <img
                src={`https://localhost:3000/${userProfile.profilePicture}`}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-white/50 dark:border-gray-600/50 cursor-pointer transition-all duration-300 hover:border-purple-400 hover:scale-110"
                onClick={() => navigate("/profile")}
              />
            ) : (
              <img
                src="/profile.png"
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-white/50 dark:border-gray-600/50 cursor-pointer transition-all duration-300 hover:border-purple-400 hover:scale-110"
                onClick={() => navigate("/profile")}
              />
            )}
          </div>
        </div>
        
        {/* Completion celebration */}
        {showCompletionGif && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="relative">
              <img
                src="/src/assets/images/completed.gif"
                alt="Lesson Completed"
                className="w-auto h-auto object-contain animate-bounce"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}