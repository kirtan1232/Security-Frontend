import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from "../../components/adminSidebar.jsx";
import { useTheme } from "../../components/ThemeContext";

const ViewChords = () => {
    const { theme } = useTheme();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedInstrument, setSelectedInstrument] = useState("All");
    const [editSong, setEditSong] = useState(null);
    const [editFormData, setEditFormData] = useState({
        songName: "",
        selectedInstrument: "",
        chordDiagrams: []
    });

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://localhost:3000/api/songs/getsongs', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSongs(Array.isArray(response.data.songs) ? response.data.songs : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching songs');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (song) => {
        setEditSong(song);
        setEditFormData({
            songName: song.songName,
            selectedInstrument: song.selectedInstrument,
            chordDiagrams: []
        });
    };

    const handleFormChange = (e, field) => {
        setEditFormData({ ...editFormData, [field]: e.target.value });
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setEditFormData({ ...editFormData, chordDiagrams: files });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No authentication token found. Please log in.");
            return;
        }
        if (!editFormData.songName || !editFormData.selectedInstrument) {
            alert("Song name and instrument are required.");
            return;
        }

        const formData = new FormData();
        formData.append("songName", editFormData.songName);
        formData.append("selectedInstrument", editFormData.selectedInstrument);
        editFormData.chordDiagrams.forEach(file => {
            formData.append("chordDiagrams", file);
        });

        try {
            const response = await axios.put(`https://localhost:3000/api/songs/${editSong._id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            alert("Song updated successfully!");
            setEditSong(null);
            fetchSongs();
        } catch (err) {
            alert(`Error updating song: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (songId) => {
        if (window.confirm("Are you sure you want to delete this song?")) {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No authentication token found. Please log in.");
                return;
            }
            if (!songId.match(/^[0-9a-fA-F]{24}$/)) {
                alert("Invalid song ID format.");
                return;
            }
            try {
                const response = await axios.delete(`https://localhost:3000/api/songs/${songId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Song deleted successfully!");
                fetchSongs();
            } catch (err) {
                alert(`Error deleting song: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const uniqueInstruments = ["All", ...new Set(songs.map(song => song.selectedInstrument))];
    const filteredSongs = selectedInstrument === "All"
        ? songs
        : songs.filter(song => song.selectedInstrument === selectedInstrument);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex">
            <AdminSidebar />
            <div className="flex-1 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-gray-800 dark:bg-opacity-80 rounded-lg shadow-md w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">View Chords</h2>
                        
                        {/* Instrument Filter Tabs */}
                        <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                            {uniqueInstruments.map((instrument) => (
                                <span
                                    key={instrument}
                                    onClick={() => setSelectedInstrument(instrument)}
                                    className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-lg transition-colors duration-200 ${
                                        selectedInstrument === instrument
                                            ? "bg-blue-500 text-white font-semibold"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    {instrument}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-700 dark:text-gray-300">Loading...</p>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-red-500 dark:text-red-400">{error}</p>
                            </div>
                        ) : filteredSongs.length > 0 ? (
                            <div className="space-y-6">
                                {filteredSongs.map((song) => (
                                    <div key={song._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
                                        {/* Song Header */}
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 truncate">
                                                        {song.songName}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                        Instrument: {song.selectedInstrument}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleEdit(song)}
                                                        className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(song._id)}
                                                        className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Song Content */}
                                        <div className="p-4 space-y-4">
                                            {/* Chord Diagrams */}
                                            {song.chordDiagrams && song.chordDiagrams.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                        Chord Diagrams:
                                                    </h4>
                                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                                                        {song.chordDiagrams.map((diagram, idx) => (
                                                            <div key={idx} className="flex-shrink-0">
                                                                <img
                                                                    src={`https://localhost:3000/${diagram}`}
                                                                    alt={`Chord Diagram ${idx + 1}`}
                                                                    className="w-24 h-24 object-contain bg-white rounded-lg border border-gray-300 dark:border-gray-600"
                                                                    onError={(e) => {
                                                                        console.log(`Failed to load image: ${diagram}`);
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Lyrics */}
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                    Lyrics:
                                                </h4>
                                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                                                    {song.lyrics && song.lyrics.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {song.lyrics.map((lyric, idx) => (
                                                                <div key={idx} className="border-l-4 border-blue-500 pl-3">
                                                                    <h5 className="font-medium text-gray-800 dark:text-gray-200">
                                                                        {lyric.section || "Unknown Section"}
                                                                    </h5>
                                                                    <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                                                                        {lyric.parsedDocxFile && lyric.parsedDocxFile.length > 0 ? (
                                                                            <div className="whitespace-pre-wrap">
                                                                                {lyric.parsedDocxFile.join("\n")}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="whitespace-pre-wrap">
                                                                                {lyric.lyrics || "No lyrics available"}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                                            No lyrics available
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    No chords available for {selectedInstrument}.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Edit Modal */}
            {editSong && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                Edit Song
                            </h3>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                        Song Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.songName}
                                        onChange={(e) => handleFormChange(e, "songName")}
                                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter song title"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                        Select Instrument
                                    </label>
                                    <select
                                        value={editFormData.selectedInstrument}
                                        onChange={(e) => handleFormChange(e, "selectedInstrument")}
                                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="guitar">Guitar</option>
                                        <option value="piano">Piano</option>
                                        <option value="ukulele">Ukulele</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                        Upload Chord Diagram(s)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="w-full p-3 text-gray-700 dark:text-gray-300 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </form>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditSong(null)}
                                    className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleEditSubmit}
                                    className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewChords;