import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from "../../components/adminSidebar.jsx";

const ViewPracticeSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedInstrument, setSelectedInstrument] = useState("All");
    const [editSession, setEditSession] = useState(null);
    const [editFormData, setEditFormData] = useState({
        instrument: "",
        day: "",
        title: "",
        description: "",
        duration: "",
        instructions: "",
        mediaUrl: "",
        file: null
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    // CSRF helper
    async function getFreshCsrfToken() {
        const res = await fetch("https://localhost:3000/api/csrf-token", { credentials: "include" });
        const { csrfToken } = await res.json();
        return csrfToken;
    }

    // Fetch sessions using cookie-based authentication (no localStorage, no Authorization header)
    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://localhost:3000/api/sessions/', {
                withCredentials: true
            });
            setSessions(Array.isArray(response.data) ? response.data : []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (session) => {
        setEditSession(session);
        setEditFormData({
            instrument: session.instrument,
            day: session.day,
            title: session.title,
            description: session.description,
            duration: session.duration,
            instructions: session.instructions,
            mediaUrl: session.file && !session.file.includes('uploads') ? session.file : "",
            file: null
        });
    };

    const handleFormChange = (e, field) => {
        if (field === "file") {
            setEditFormData({ ...editFormData, file: e.target.files[0] });
        } else {
            setEditFormData({ ...editFormData, [field]: e.target.value });
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editFormData.instrument || !editFormData.day || !editFormData.title ||
            !editFormData.description || !editFormData.duration || !editFormData.instructions) {
            alert("All fields except media are required.");
            return;
        }
        const formData = new FormData();
        formData.append("instrument", editFormData.instrument);
        formData.append("day", editFormData.day);
        formData.append("title", editFormData.title);
        formData.append("description", editFormData.description);
        formData.append("duration", editFormData.duration);
        formData.append("instructions", editFormData.instructions);
        if (editFormData.mediaUrl) {
            formData.append("mediaUrl", editFormData.mediaUrl);
        }
        if (editFormData.file) {
            formData.append("file", editFormData.file);
        }
        try {
            const csrfToken = await getFreshCsrfToken();
            await axios.put(
                `https://localhost:3000/api/sessions/${editSession._id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-CSRF-Token": csrfToken
                    },
                    withCredentials: true
                }
            );
            alert("Session updated successfully!");
            setEditSession(null);
            fetchSessions();
        } catch (err) {
            alert(`Error updating session: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleDelete = async (sessionId) => {
        if (window.confirm("Are you sure you want to delete this session?")) {
            if (!sessionId.match(/^[0-9a-fA-F]{24}$/)) {
                alert("Invalid session ID format.");
                return;
            }
            try {
                const csrfToken = await getFreshCsrfToken();
                await axios.delete(
                    `https://localhost:3000/api/sessions/${sessionId}`,
                    {
                        headers: {
                            "X-CSRF-Token": csrfToken
                        },
                        withCredentials: true
                    }
                );
                alert("Session deleted successfully!");
                fetchSessions();
            } catch (err) {
                alert(`Error deleting session: ${err.response?.data?.error || err.message}`);
            }
        }
    };

    const filteredSessions = selectedInstrument === "All"
        ? sessions
        : sessions.filter(session => session.instrument === selectedInstrument);

    const uniqueInstruments = ["All", ...new Set(sessions.map(session => session.instrument))];

    const renderMedia = (file) => {
        if (!file) return null;

        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
        const match = file.match(youtubeRegex);
        if (match) {
            const videoId = match[1];
            return (
                <div className="relative w-full max-w-[356px]" style={{ paddingBottom: '200px' }}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="Practice Session Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            );
        }

        const fileExtension = file.split('.').pop().toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const videoExtensions = ['mp4', 'webm', 'ogg'];

        if (imageExtensions.includes(fileExtension)) {
            return (
                <div className="w-full max-h-[200px] flex justify-center">
                    <img
                        src={`https://localhost:3000/${file}`}
                        alt="Practice Session Image"
                        className="max-w-full max-h-[200px] object-contain"
                        onError={(e) => {
                            e.target.outerHTML = `<a href="https://localhost:3000/${file}" target="_blank" class="text-blue-400 underline">${file}</a>`;
                        }}
                    />
                </div>
            );
        }

        if (videoExtensions.includes(fileExtension)) {
            return (
                <div className="w-full max-h-[200px] flex justify-center">
                    <video
                        controls
                        className="max-w-full max-h-[200px] object-contain"
                        onError={(e) => {
                            e.target.outerHTML = `<a href="https://localhost:3000/${file}" target="_blank" class="text-blue-400 underline">${file}</a>`;
                        }}
                    >
                        <source src={`https://localhost:3000/${file}`} type={`video/${fileExtension}`} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        return (
            <a href={`https://localhost:3000/${file}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                {file}
            </a>
        );
    };

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-800 rounded-full opacity-20 animate-pulse delay-2000"></div>
            </div>
            
            <AdminSidebar />
            <div className="flex justify-center items-center w-full relative z-10">
                <div className="p-6 bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-xl border border-gray-700/50 w-full sm:w-[90%] md:w-[80%] lg:w-[65%] ml-0 md:ml-[-5%] h-[90vh] flex flex-col">
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">View Practice Sessions</h2>
                    <div className="flex flex-wrap gap-4 justify-start mb-6">
                        {uniqueInstruments.map((instrument) => (
                            <span
                                key={instrument}
                                onClick={() => setSelectedInstrument(instrument)}
                                className={`cursor-pointer ${
                                    selectedInstrument === instrument
                                        ? "text-blue-400 underline font-semibold"
                                        : "text-gray-300 hover:text-blue-400"
                                }`}
                            >
                                {instrument}
                            </span>
                        ))}
                    </div>
                    <div className="overflow-y-auto flex-grow p-2">
                        {loading ? (
                            <p className="text-gray-300">Loading...</p>
                        ) : error ? (
                            <p className="text-red-400">{error}</p>
                        ) : filteredSessions.length > 0 ? (
                            <ul className="space-y-2">
                                {filteredSessions.map((session) => (
                                    <li key={session._id} className="p-4 bg-gray-700 rounded shadow">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                                            <strong className="text-gray-200">{session.title}</strong>
                                            <div className="flex gap-2 mt-2 md:mt-0">
                                                <button
                                                    onClick={() => handleEdit(session)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg transition-colors hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(session._id)}
                                                    className="px-3 py-1 bg-red-600 text-white rounded-lg transition-colors hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-300">Day: {session.day}, Instrument: {session.instrument}, Duration: {session.duration} mins</p>
                                        <p className="mt-1 text-gray-300"><strong>Description:</strong> {session.description}</p>
                                        <p className="mt-1 text-gray-300"><strong>Instructions:</strong> {session.instructions}</p>
                                        {session.file && (
                                            <div className="mt-2">
                                                <p className="font-semibold text-gray-200">Media:</p>
                                                {renderMedia(session.file)}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-300">No practice sessions available.</p>
                        )}
                    </div>
                </div>
            </div>
            {editSession && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl border border-gray-700 overflow-y-auto max-h-[95vh]">
                        <h3 className="text-xl font-bold mb-4 text-gray-200">Edit Session</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 font-medium mb-2">Instrument</label>
                                <select
                                    value={editFormData.instrument}
                                    onChange={(e) => handleFormChange(e, "instrument")}
                                    className="w-full p-2 border rounded-lg bg-gray-700 text-gray-300 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="guitar">Guitar</option>
                                    <option value="piano">Piano</option>
                                    <option value="ukulele">Ukulele</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300 font-medium mb-2">Day</label>
                                <input
                                    type="text"
                                    value={editFormData.day}
                                    onChange={(e) => handleFormChange(e, "day")}
                                    className="w-full p-2 border rounded-lg bg-gray-700 text-gray-300 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder="e.g., Monday"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editFormData.title}
                                    onChange={(e) => handleFormChange(e, "title")}
                                    className="w-full p-2 border rounded-lg bg-gray-700 text-gray-300 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder="Session title"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 font-medium mb-2">Description</label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={(e) => handleFormChange(e, "description")}
                                    className="w-full p-2 border rounded-lg bg-gray-700 text-gray-300 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder="Session description"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 font-medium mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={editFormData.duration}
                                    onChange={(e) => handleFormChange(e, "duration")}
                                    className="w-full p-2 border rounded-lg bg-gray-700 text-gray-300 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder="Duration in minutes"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 font-medium mb-2">Instructions</label>
                                <textarea
                                    value={editFormData.instructions}
                                    onChange={(e) => handleFormChange(e, "instructions")}
                                    className="w-full p-2 border rounded-lg bg-gray-700 text-gray-300 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder="Session instructions"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 font-medium mb-2">YouTube URL (optional)</label>
                                <input
                                    type="text"
                                    value={editFormData.mediaUrl}
                                    onChange={(e) => handleFormChange(e, "mediaUrl")}
                                    className="w-full p-2 border rounded-lg bg-gray-700 text-gray-300 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder="YouTube URL"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 font-medium mb-2">Upload Media (optional)</label>
                                <input
                                    type="file"
                                    onChange={(e) => handleFormChange(e, "file")}
                                    className="w-full p-2 text-gray-300"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditSession(null)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewPracticeSessions;