import React, { useState } from "react";
import AdminSidebar from "../../components/adminSidebar.jsx";
import axios from "axios";
import { useTheme } from "../../components/ThemeContext";

export default function AddPracticeSession() {
    const { theme } = useTheme();
    const [session, setSession] = useState({
        instrument: "Guitar",
        day: "Day 1",
        title: "",
        description: "",
        duration: "",
        instructions: "",
        mediaUrl: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [savedFile, setSavedFile] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSession({ ...session, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!session.title || !session.description || !session.duration || !session.instructions) {
            setError("Please fill in all required fields.");
            return;
        }
        if (session.duration <= 0) {
            setError("Duration must be greater than 0.");
            return;
        }

        setLoading(true);
        setError("");

        const formData = {
            instrument: session.instrument,
            day: session.day,
            title: session.title,
            description: session.description,
            duration: session.duration,
            instructions: session.instructions,
            mediaUrl: session.mediaUrl,
        };

        console.log("Form data being sent:", formData);

        try {
            const response = await axios.post("https://localhost:3000/api/sessions/", formData);
            console.log("Response from server:", response.data);

            if (response.status === 201) {
                setSuccess(`Practice session for ${session.instrument} - ${session.day} added successfully!`);
                setSavedFile(response.data.session.file);

                setSession({
                    instrument: "Guitar",
                    day: "Day 1",
                    title: "",
                    description: "",
                    duration: "",
                    instructions: "",
                    mediaUrl: "",
                });
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error("Error during submission:", err);
        } finally {
            setLoading(false);
        }
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return "";
        if (url.includes("youtu.be")) {
            return `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
        }
        return url.replace("watch?v=", "embed/");
    };

    const getInstrumentIcon = (instrument) => {
        switch (instrument) {
            case 'Guitar': return '🎸';
            case 'Piano': return '🎹';
            case 'Ukulele': return '🎸';
            default: return '🎵';
        }
    };

    const getDayIcon = (day) => {
        const dayNumber = day.split(' ')[1];
        return `📅`;
    };

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 p-6 flex justify-center items-center overflow-hidden">
                <div className="w-full max-w-4xl h-full bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header - Fixed */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 p-6 text-white">
                        <h2 className="text-3xl font-bold mb-2">Add Practice Session</h2>
                        <p className="text-purple-100 dark:text-purple-200">Create structured practice sessions for your musical journey</p>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Instrument and Day Selection Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold mb-3">
                                        <i className="fas fa-guitar mr-2 text-blue-500"></i>
                                        Select Instrument
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="instrument"
                                            value={session.instrument}
                                            onChange={handleChange}
                                            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 appearance-none cursor-pointer"
                                        >
                                            <option value="Guitar">🎸 Guitar</option>
                                            <option value="Piano">🎹 Piano</option>
                                            <option value="Ukulele">🎸 Ukulele</option>
                                        </select>
                                        <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold mb-3">
                                        <i className="fas fa-calendar-day mr-2 text-blue-500"></i>
                                        Practice Day
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="day"
                                            value={session.day}
                                            onChange={handleChange}
                                            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 appearance-none cursor-pointer"
                                        >
                                            <option value="Day 1">📅 Day 1</option>
                                            <option value="Day 2">📅 Day 2</option>
                                            <option value="Day 3">📅 Day 3</option>
                                            <option value="Day 4">📅 Day 4</option>
                                            <option value="Day 5">📅 Day 5</option>
                                            <option value="Day 6">📅 Day 6</option>
                                            <option value="Day 7">📅 Day 7</option>
                                        </select>
                                        <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                                    </div>
                                </div>
                            </div>

                            {/* Session Title */}
                            <div className="group">
                                <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold mb-3">
                                    <i className="fas fa-heading mr-2 text-blue-500"></i>
                                    Session Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={session.title}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm dark:bg-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                                    placeholder="Enter a descriptive title for your practice session..."
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="group">
                                <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold mb-3">
                                    <i className="fas fa-align-left mr-2 text-blue-500"></i>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={session.description}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm dark:bg-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 resize-none"
                                    rows="4"
                                    placeholder="Provide a brief overview of what this practice session covers..."
                                    required
                                ></textarea>
                            </div>

                            {/* Duration */}
                            <div className="group">
                                <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold mb-3">
                                    <i className="fas fa-clock mr-2 text-blue-500"></i>
                                    Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={session.duration}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm dark:bg-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                                    min="1"
                                    placeholder="How long should this practice session be?"
                                    required
                                />
                            </div>

                            {/* Instructions */}
                            <div className="group">
                                <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold mb-3">
                                    <i className="fas fa-list-ol mr-2 text-blue-500"></i>
                                    Practice Instructions
                                </label>
                                <textarea
                                    name="instructions"
                                    value={session.instructions}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm dark:bg-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 resize-none"
                                    rows="6"
                                    placeholder="Write detailed step-by-step instructions for this practice session..."
                                    required
                                ></textarea>
                            </div>

                            {/* YouTube URL */}
                            <div className="group">
                                <label className="flex items-center text-gray-7
00 dark:text-gray-300 font-semibold mb-3">
                                    <i className="fab fa-youtube mr-2 text-red-500"></i>
                                    YouTube Video URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    name="mediaUrl"
                                    value={session.mediaUrl}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm dark:bg-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Add a YouTube video to help guide the practice session
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                    <div className="flex items-center">
                                        <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                                        <p className="text-red-700 dark:text-red-400">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                    <div className="flex items-center mb-2">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <p className="text-green-700 dark:text-green-400">{success}</p>
                                    </div>
                                    {savedFile && (
                                        <div className="mt-4">
                                            <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-2 flex items-center">
                                                <i className="fas fa-play-circle mr-2"></i>
                                                Video Preview:
                                            </h3>
                                            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                <iframe
                                                    src={getYouTubeEmbedUrl(savedFile)}
                                                    frameBorder="0"
                                                    className="w-full h-full"
                                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    title="Video Preview"
                                                ></iframe>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-center pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[200px]"
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-plus-circle mr-2"></i>
                                            Add Practice Session
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}