import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from "../../components/adminSidebar.jsx";
import { useTheme } from "../../components/ThemeContext";

const ViewLessons = () => {
    const { theme } = useTheme(); // Get theme from context
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedInstrument, setSelectedInstrument] = useState("All");
    const [editQuiz, setEditQuiz] = useState(null);
    const [editForm, setEditForm] = useState({ day: '', instrument: '', quizzes: [] });

    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            try {
                const response = await axios.get('https://localhost:3000/api/quiz/getAllQuizzes', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const fetchedQuizzes = Array.isArray(response.data) ? response.data : [];
                setQuizzes(fetchedQuizzes);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch lessons. Please check your connection or login status.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const handleEditQuiz = (quiz) => {
        setEditQuiz(quiz);
        setEditForm({
            day: quiz.day,
            instrument: quiz.instrument,
            quizzes: quiz.quizzes.map(q => ({
                question: q.question,
                options: q.options.join(','),
                correctAnswer: q.correctAnswer,
                chordDiagram: null,
            })),
        });
    };

    const handleEditFormChange = (field, value, index = null) => {
        if (index !== null) {
            const newQuizzes = [...editForm.quizzes];
            newQuizzes[index] = { ...newQuizzes[index], [field]: value };
            setEditForm({ ...editForm, quizzes: newQuizzes });
        } else {
            setEditForm({ ...editForm, [field]: value });
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            const quizData = {
                day: editForm.day,
                instrument: editForm.instrument,
                quizzes: editForm.quizzes.map(q => ({
                    question: q.question,
                    options: q.options.split(',').map(opt => opt.trim()),
                    correctAnswer: q.correctAnswer,
                })),
            };
            formData.append('quizData', JSON.stringify(quizData));

            editForm.quizzes.forEach((q, index) => {
                if (q.chordDiagram) {
                    formData.append('chordDiagrams', q.chordDiagram);
                }
            });

            const response = await axios.put(`https://localhost:3000/api/quiz/updatequiz/${editQuiz._id}`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setQuizzes(quizzes.map(q => q._id === editQuiz._id ? response.data.quiz : q));
            setEditQuiz(null);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update quiz.');
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        try {
            await axios.delete(`https://localhost:3000/api/quiz/deletequiz/${quizId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setQuizzes(quizzes.filter(q => q._id !== quizId));
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete quiz.');
        }
    };

    const uniqueDays = [...new Set(quizzes.map(quiz => quiz.day))].sort();
    const uniqueInstruments = ["All", ...new Set(quizzes.map(quiz => quiz.instrument))];
    const filteredQuizzes = selectedInstrument === "All"
        ? quizzes
        : quizzes.filter(quiz => quiz.instrument === selectedInstrument);
    const quizzesByDay = uniqueDays.reduce((acc, day) => {
        acc[day] = filteredQuizzes.filter(quiz => quiz.day === day);
        return acc;
    }, {});

    return (
        <div className="h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex">
            <AdminSidebar />
            <div className="flex justify-center items-center w-full">
                <div className="p-6 bg-white dark:bg-gray-800 dark:bg-opacity-80 rounded-lg shadow-md w-[65%] ml-[-5%] h-[90vh] flex flex-col">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">View Lessons</h2>
                    <div className="flex justify-start space-x-8 mb-6">
                        {uniqueInstruments.map((instrument) => (
                            <span
                                key={instrument}
                                onClick={() => setSelectedInstrument(instrument)}
                                className={`cursor-pointer ${
                                    selectedInstrument === instrument
                                        ? "text-blue-500 dark:text-blue-400 underline font-semibold"
                                        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                                }`}
                            >
                                {instrument}
                            </span>
                        ))}
                    </div>
                    <div className="overflow-y-auto flex-grow p-2 space-y-4">
                        {loading ? (
                            <p className="text-gray-700 dark:text-gray-300">Loading lessons...</p>
                        ) : error ? (
                            <p className="text-red-500 dark:text-red-400">{error}</p>
                        ) : uniqueDays.length > 0 ? (
                            uniqueDays.map((day) => (
                                <div key={day} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md">
                                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{day}</h3>
                                    {quizzesByDay[day].length > 0 ? (
                                        quizzesByDay[day].map((quiz, index) => (
                                            <div
                                                key={quiz._id}
                                                className="p-4 bg-white dark:bg-gray-700 bg-opacity-60 backdrop-blur-lg rounded-xl shadow-md mb-4"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                        {quiz.instrument} Quiz {index + 1}
                                                    </h4>
                                                    <div>
                                                        <button
                                                            onClick={() => handleEditQuiz(quiz)}
                                                            className="mr-2 px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuiz(quiz._id)}
                                                            className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                {quiz.quizzes && quiz.quizzes.length > 0 ? (
                                                    quiz.quizzes.map((q, qIndex) => (
                                                        <div key={qIndex} className="mb-4">
                                                            <p className="font-medium text-gray-700 dark:text-gray-300">
                                                                Question {qIndex + 1}: {q.question || 'No question available'}
                                                            </p>
                                                            {q.chordDiagram && (
                                                                <img
                                                                    src={`https://localhost:3000/uploads/${q.chordDiagram}`}
                                                                    alt="Chord Diagram"
                                                                    className="w-full h-36 object-contain my-2"
                                                                    onError={(e) => {
                                                                        e.target.src = "/assets/images/placeholder.png";
                                                                    }}
                                                                />
                                                            )}
                                                            <ul className="space-y-1">
                                                                {q.options?.map((option, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className="p-1 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                                                                    >
                                                                        {option || 'No option available'}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <p className="text-blue-600 dark:text-blue-400 font-semibold mt-2">
                                                                Correct Answer: {q.correctAnswer || 'N/A'}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-700 dark:text-gray-300">No quizzes available for this lesson.</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">No lessons available for {day} with {selectedInstrument}.</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">No lessons available. Try adding quizzes or check your connection.</p>
                        )}
                    </div>
                </div>
            </div>
            {editQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[80%] max-w-4xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Edit Quiz</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300">Day</label>
                                <input
                                    type="text"
                                    value={editForm.day}
                                    onChange={(e) => handleEditFormChange('day', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300">Instrument</label>
                                <input
                                    type="text"
                                    value={editForm.instrument}
                                    onChange={(e) => handleEditFormChange('instrument', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                    required
                                />
                            </div>
                            {editForm.quizzes.map((q, index) => (
                                <div key={index} className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
                                    <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Question {index + 1}</h4>
                                    <div className="mb-2">
                                        <label className="block text-gray-700 dark:text-gray-300">Question</label>
                                        <input
                                            type="text"
                                            value={q.question}
                                            onChange={(e) => handleEditFormChange('question', e.target.value, index)}
                                            className="w-full p-2 border rounded dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-gray-700 dark:text-gray-300">Options (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={q.options}
                                            onChange={(e) => handleEditFormChange('options', e.target.value, index)}
                                            className="w-full p-2 border rounded dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-gray-700 dark:text-gray-300">Correct Answer</label>
                                        <input
                                            type="text"
                                            value={q.correctAnswer}
                                            onChange={(e) => handleEditFormChange('correctAnswer', e.target.value, index)}
                                            className="w-full p-2 border rounded dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-gray-700 dark:text-gray-300">Chord Diagram</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleEditFormChange('chordDiagram', e.target.files[0], index)}
                                            className="w-full p-2 text-gray-700 dark:text-gray-300"
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setEditQuiz(null)}
                                    className="mr-2 px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewLessons;