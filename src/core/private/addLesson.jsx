import React, { useState } from "react";
import AdminSidebar from "../../components/adminSidebar.jsx";
import { useTheme } from "../../components/ThemeContext";

export default function AddQuiz() {
    const { theme } = useTheme();
    const [day, setDay] = useState("");
    const [quizzes, setQuizzes] = useState([]);
    const [docxFiles, setDocxFiles] = useState([]);
    const [instrument, setInstrument] = useState("guitar");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const updatedQuizzes = [...quizzes];
        updatedQuizzes[index] = { ...updatedQuizzes[index], [name]: value };
        setQuizzes(updatedQuizzes);
    };

    const handleOptionChange = (index, optionIndex, value) => {
        const updatedQuizzes = [...quizzes];
        updatedQuizzes[index].options[optionIndex] = value;
        setQuizzes(updatedQuizzes);
    };

    const handleDiagramChange = (index, e) => {
        const updatedQuizzes = [...quizzes];
        const file = e.target.files[0];
        if (file) {
            updatedQuizzes[index].chordDiagram = file;
            const fileIndex = quizzes.filter(q => q.chordDiagram).length;
            updatedQuizzes[index].fileIndex = fileIndex;
        } else {
            updatedQuizzes[index].chordDiagram = null;
            updatedQuizzes[index].fileIndex = null;
        }
        setQuizzes(updatedQuizzes);
    };

    const handleDocxFileChange = (event) => {
        setDocxFiles([...event.target.files]);
    };

    const addQuiz = () => {
        if (quizzes.length < 5) {
            setQuizzes([
                ...quizzes,
                {
                    question: "",
                    chordDiagram: null,
                    fileIndex: null,
                    options: ["", "", "", ""],
                    correctAnswer: "",
                },
            ]);
        } else {
            alert("You can only add up to 5 quizzes.");
        }
    };

    const removeQuiz = (index) => {
        const updatedQuizzes = quizzes.filter((_, i) => i !== index);
        setQuizzes(updatedQuizzes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formData = new FormData();

        const quizData = {
            day,
            instrument,
            quizzes: quizzes.map((quiz, index) => ({
                question: quiz.question,
                options: quiz.options,
                correctAnswer: quiz.correctAnswer,
                fileIndex: quiz.fileIndex,
            })),
        };

        formData.append("quizData", JSON.stringify(quizData));

        const chordDiagrams = quizzes
            .filter(quiz => quiz.chordDiagram && quiz.fileIndex != null)
            .sort((a, b) => a.fileIndex - b.fileIndex)
            .map(quiz => quiz.chordDiagram);

        chordDiagrams.forEach((file, index) => {
            formData.append("chordDiagrams", file);
        });

        docxFiles.forEach((file) => {
            formData.append("docxFiles", file);
        });

        try {
            const response = await fetch("httpss://localhost:3000/api/quiz/addquiz", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to add quizzes");
            }

            alert("Quizzes added successfully!");
            setQuizzes([]);
            setDocxFiles([]);
            setDay("");
            setInstrument("guitar");
        } catch (error) {
            console.error("Error:", error);
            alert("Error adding quizzes. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
            <AdminSidebar />
            <div className="flex-1 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 p-6 text-white">
                        <h2 className="text-3xl font-bold mb-2">Add New Quizzes</h2>
                        <p className="text-purple-100 dark:text-purple-200">Create engaging quizzes for your music lessons</p>
                    </div>

                    {/* Main Content with Scroll */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                            {/* Configuration Section */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quiz Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Select Day
                                        </label>
                                        <select
                                            value={day}
                                            onChange={(e) => setDay(e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            required
                                        >
                                            <option value="" disabled>Select a day</option>
                                            {Array.from({ length: 7 }, (_, i) => (
                                                <option key={i} value={`Day ${i + 1}`}>{`Day ${i + 1}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Select Instrument
                                        </label>
                                        <select
                                            value={instrument}
                                            onChange={(e) => setInstrument(e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            required
                                        >
                                            <option value="guitar">🎸 Guitar</option>
                                            <option value="ukulele">🎵 Ukulele</option>
                                            <option value="piano">🎹 Piano</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Optional: Supporting Documents Section */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                    📄 Additional Resources (Optional)
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                    Upload lesson materials, answer explanations, or reference documents that complement your quiz
                                </p>
                                <input
                                    type="file"
                                    accept=".docx,.pdf,.doc"
                                    multiple
                                    onChange={handleDocxFileChange}
                                    className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                                />
                                {docxFiles.length > 0 && (
                                    <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                        ✓ {docxFiles.length} resource file(s) selected
                                    </div>
                                )}
                            </div>

                            {/* Quizzes Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Quiz Questions ({quizzes.length}/5)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addQuiz}
                                        disabled={quizzes.length >= 5}
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        + Add Quiz
                                    </button>
                                </div>

                                {quizzes.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <div className="text-6xl mb-4">🎯</div>
                                        <p className="text-lg">No quizzes added yet. Click "Add Quiz" to get started!</p>
                                    </div>
                                )}

                                {quizzes.map((quiz, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium mr-3">
                                                    Quiz {index + 1}
                                                </span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => removeQuiz(index)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Remove this quiz"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Question
                                                </label>
                                                <input
                                                    type="text"
                                                    name="question"
                                                    value={quiz.question}
                                                    onChange={(e) => handleChange(index, e)}
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                                    placeholder="Enter your quiz question here..."
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Chord Diagram (Optional)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleDiagramChange(index, e)}
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-200"
                                                />
                                                {quiz.chordDiagram && (
                                                    <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                                                        ✓ Image uploaded
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                    Answer Options
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {quiz.options.map((option, optionIndex) => (
                                                        <div key={optionIndex} className="flex items-center space-x-2">
                                                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium min-w-[60px] text-center">
                                                                {String.fromCharCode(65 + optionIndex)}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={option}
                                                                onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                                                placeholder={`Option ${optionIndex + 1}`}
                                                                required
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Correct Answer
                                                </label>
                                                <input
                                                    type="text"
                                                    name="correctAnswer"
                                                    value={quiz.correctAnswer}
                                                    onChange={(e) => handleChange(index, e)}
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                    placeholder="Enter the correct answer"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Submit Button */}
                            {quizzes.length > 0 && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </span>
                                        ) : (
                                            `Submit ${quizzes.length} Quiz${quizzes.length > 1 ? 'es' : ''}`
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}