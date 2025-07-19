import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from "../../components/adminSidebar.jsx";
import { useTheme } from "../../components/ThemeContext";

const ViewPracticeSessions = () => {
    const { theme } = useTheme(); // Get theme from context
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

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }
            const response = await axios.get('https://localhost:3000/api/sessions/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSessions(Array.isArray(response.data) ? response.data : []);
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
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No authentication token found. Please log in.");
            return;
        }
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
            const response = await axios.put(`https://localhost:3000/api/sessions/${editSession._id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            alert("Session updated successfully!");
            setEditSession(null);
            fetchSessions();
        } catch (err) {
            alert(`Error updating session: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleDelete = async (sessionId) => {
        if (window.confirm("Are you sure you want to delete this session?")) {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No authentication token found. Please log in.");
                return;
            }
            if (!sessionId.match(/^[0-9a-fA-F]{24}$/)) {
                alert("Invalid session ID format.");
                return;
            }
            try {
                const response = await axios.delete(`https://localhost:3000/api/sessions/${sessionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
                            e.target.outerHTML = `<a href="https://localhost:3000/${file}" target="_blank" class="text-blue-500 dark:text-blue-400 underline">${file}</a>`;
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
                            e.target.outerHTML = `<a href="https://localhost:3000/${file}" target="_blank" class="text-blue-500 dark:text-blue-400 underline">${file}</a>`;
                        }}
                    >
                        <source src={`https://localhost:3000/${file}`} type={`video/${fileExtension}`} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        return (
            <a href={`https://localhost:3000/${file}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 underline">
                {file}
            </a>
        );
    };

    return (
        <div className="h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex">
            <AdminSidebar />
            <div className="flex justify-center items-center w-full">
                <div className="p-6 bg-white dark:bg-gray-800 dark:bg-opacity-80 rounded-lg shadow-md w-[65%] ml-[-5%] h-[90vh] flex flex-col">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">View Practice Sessions</h2>
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
                    <div className="overflow-y-auto flex-grow p-2">
                        {loading ? (
                            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
                        ) : error ? (
                            <p className="text-red-500 dark:text-red-400">{error}</p>
                        ) : filteredSessions.length > 0 ? (
                            <ul className="space-y-2">
                                {filteredSessions.map((session) => (
                                    <li key={session._id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded shadow">
                                        <div className="flex justify-between items-center">
                                            <strong className="text-gray-800 dark:text-gray-200">{session.title}</strong>
                                            <div>
                                                <button
                                                    onClick={() => handleEdit(session)}
                                                    className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded-lg mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(session._id)}
                                                    className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white rounded-lg"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">Day: {session.day}, Instrument: {session.instrument}, Duration: {session.duration} mins</p>
                                        <p className="mt-1 text-gray-700 dark:text-gray-300"><strong>Description:</strong> {session.description}</p>
                                        <p className="mt-1 text-gray-700 dark:text-gray-300"><strong>Instructions:</strong> {session.instructions}</p>
                                        {session.file && (
                                            <div className="mt-2">
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">Media:</p>
                                                {renderMedia(session.file)}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300">No practice sessions available.</p>
                        )}
                    </div>
                </div>
            </div>
            {editSession && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Edit Session</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Instrument</label>
                                <select
                                    value={editFormData.instrument}
                                    onChange={(e) => handleFormChange(e, "instrument")}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                >
                                    <option value="guitar">Guitar</option>
                                    <option value="piano">Piano</option>
                                    <option value="ukulele">Ukulele</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Day</label>
                                <input
                                    type="text"
                                    value={editFormData.day}
                                    onChange={(e) => handleFormChange(e, "day")}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                    placeholder="e.g., Monday"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editFormData.title}
                                    onChange={(e) => handleFormChange(e, "title")}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                    placeholder="Session title"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Description</label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={(e) => handleFormChange(e, "description")}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                    placeholder="Session description"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={editFormData.duration}
                                    onChange={(e) => handleFormChange(e, "duration")}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                    placeholder="Duration in minutes"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Instructions</label>
                                <textarea
                                    value={editFormData.instructions}
                                    onChange={(e) => handleFormChange(e, "instructions")}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                    placeholder="Session instructions"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">YouTube URL (optional)</label>
                                <input
                                    type="text"
                                    value={editFormData.mediaUrl}
                                    onChange={(e) => handleFormChange(e, "mediaUrl")}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                    placeholder="YouTube URL"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Upload Media (optional)</label>
                                <input
                                    type="file"
                                    onChange={(e) => handleFormChange(e, "file")}
                                    className="w-full p-2 text-gray-700 dark:text-gray-300"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setEditSession(null)}
                                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1 bg-green-500 dark:bg-green-600 text-white rounded-lg"
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