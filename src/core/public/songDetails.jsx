import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from "../../components/sidebar.jsx";
import Footer from "../../components/footer.jsx";

const SongDetails = () => {
    const { songId } = useParams();
    const [song, setSong] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fontSize, setFontSize] = useState(16);
    const [autoScroll, setAutoScroll] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(5);
    const lyricsRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Use only cookies (no Authorization header, no localStorage)
                const response = await axios.get("https://localhost:3000/api/auth/profile", {
                    withCredentials: true,
                });
                setUserProfile(response.data);
            } catch (error) {
                alert("Error fetching user profile: " + (error.response?.data?.message || error.message));
            }
        };

        const fetchSong = async () => {
            try {
                const response = await axios.get(`https://localhost:3000/api/songs/${songId}`, {
                    withCredentials: true,
                });
                setSong(response.data);
            } catch (error) {
                alert("Error fetching song details: " + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        };
        fetchSong();
        fetchUserProfile();
    }, [songId]);

    useEffect(() => {
        let scrollInterval;
        if (autoScroll && lyricsRef.current) {
            scrollInterval = setInterval(() => {
                if (lyricsRef.current.scrollTop + lyricsRef.current.clientHeight < lyricsRef.current.scrollHeight) {
                    lyricsRef.current.scrollTop += scrollSpeed;
                } else {
                    setAutoScroll(false);
                }
            }, 100);
        }
        return () => clearInterval(scrollInterval);
    }, [autoScroll, scrollSpeed]);

    useEffect(() => {
        const handleScroll = () => {
            if (lyricsRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = lyricsRef.current;
                const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
                setScrollProgress(progress);
            }
        };
        if (lyricsRef.current) {
            lyricsRef.current.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (lyricsRef.current) {
                lyricsRef.current.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    if (loading) return <div className="text-gray-400">Loading...</div>;
    if (!song) return <div className="text-gray-400">Song not found.</div>;

    const renderLyrics = (lines) => (
        <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: `${fontSize}px`, color: '#E5E7EB' }}>
            {Array.isArray(lines) ? lines.join('\n') : lines}
        </pre>
    );

    return (
        <div className="bg-gradient-to-br min-h-screen flex flex-col from-gray-900 via-indigo-900 to-purple-900">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-800 rounded-full opacity-20 animate-pulse delay-2000"></div>
            </div>
            
            <div className="relative flex flex-1 z-10">
                <Sidebar />
                <main className="flex-1 p-6 flex justify-center items-start mt-4">
                    <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8 w-full max-w-7xl h-[85vh] flex flex-col relative overflow-y-auto">
                        <header className="mb-6">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-wider text-center">
                                Song - {song.songName}
                            </h1>
                        </header>
                        <p className="text-lg text-gray-300 mt-4"><strong>Instrument:</strong> {song.selectedInstrument}</p>
                        <h2 className="text-xl font-semibold mt-4 text-gray-200">Chord Diagrams:</h2>
                        <div className="flex flex-wrap gap-4 mt-2">
                            {song.chordDiagrams && song.chordDiagrams.length > 0 ? (
                                song.chordDiagrams.map((chord, index) => (
                                    <img
                                        key={index}
                                        src={`https://localhost:3000/${chord}`}
                                        alt={`Chord Diagram ${index + 1}`}
                                        className={`rounded shadow-md ${
                                            song.chordDiagrams.length === 1
                                                ? 'w-full max-w-md h-auto'
                                                : 'w-24 h-auto'
                                        }`}
                                        onError={(e) => {
                                            e.target.src = "/assets/images/placeholder.png";
                                        }}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-400">No chord diagrams available.</p>
                            )}
                        </div>
                        <h2 className="text-xl font-semibold mt-4 text-gray-200">Lyrics:</h2>
                        <div ref={lyricsRef} className="flex-1 overflow-y-auto p-2 bg-gray-700 rounded-lg custom-scrollbar">
                            {song.lyrics && song.lyrics.length > 0 ? (
                                song.lyrics.map((lyric, index) => (
                                    <div key={index} className="mt-2">
                                        <h3 className="text-lg font-semibold text-gray-200">{lyric.section || "Unknown Section"}</h3>
                                        <div>
                                            {lyric.parsedDocxFile && lyric.parsedDocxFile.length > 0 ? (
                                                <div className="mt-1 bg-gray-600 p-4 rounded-lg">
                                                    {renderLyrics(lyric.parsedDocxFile)}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400">{lyric.lyrics || "No lyrics available."}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No lyrics available.</p>
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-3 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm p-4 rounded-lg shadow-md w-full animate-fadeInUp animation-delay-300">
                            <div className="flex items-center space-x-4 flex-1 justify-center">
                                <button 
                                    onClick={() => setFontSize(fontSize - 1)}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-md font-medium shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                                >
                                    - Font
                                </button>
                                <span className="text-gray-300 font-bold min-w-[60px] text-center bg-gray-800/50 px-3 py-1 rounded-lg">
                                    {fontSize}px
                                </span>
                                <button 
                                    onClick={() => setFontSize(fontSize + 1)}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-md font-medium shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                                >
                                    + Font
                                </button>
                            </div>
                            <div className="flex-1 flex justify-center">
                                <button
                                    onClick={() => setAutoScroll(!autoScroll)}
                                    className={`px-4 py-2 rounded-md font-medium transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 ${
                                        autoScroll 
                                            ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white" 
                                            : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                                    }`}
                                >
                                    {autoScroll ? (
                                        <span className="flex items-center">
                                            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                                            Stop Scroll
                                        </span>
                                    ) : (
                                        "Auto Scroll"
                                    )}
                                </button>
                            </div>
                            <div className="flex items-center space-x-3 flex-1 justify-center">
                                <span className="text-gray-300 font-medium">Speed:</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={scrollSpeed}
                                    onChange={(e) => setScrollSpeed(Number(e.target.value))}
                                    className="cursor-pointer w-24 h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none slider"
                                />
                                <span className="text-sm text-gray-300 font-bold min-w-[20px] text-center bg-gray-800/50 px-2 py-1 rounded">
                                    {scrollSpeed}
                                </span>
                            </div>
                        </div>
                    </div>
                </main>
                
                {/* Enhanced Profile Picture */}
                <div className="absolute top-4 right-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative bg-gray-800/80 backdrop-blur-lg rounded-full p-1">
                            {userProfile && userProfile.profilePicture ? (
                                <img
                                    src={`https://localhost:3000/${userProfile.profilePicture}`}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full border-2 border-gray-600 cursor-pointer hover:scale-110 transition-transform duration-300"
                                    onClick={() => navigate("/profile")}
                                />
                            ) : (
                                <img
                                    src="/profile.png"
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full border-2 border-gray-600 cursor-pointer hover:scale-110 transition-transform duration-300"
                                    onClick={() => navigate("/profile")}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out forwards;
                }

                .animation-delay-300 {
                    animation-delay: 300ms;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #8B5CF6, #EC4899);
                    border-radius: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #7C3AED, #DB2777);
                }

                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    background: linear-gradient(to right, #8B5CF6, #EC4899);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                }

                .slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }

                .slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    background: linear-gradient(to right, #8B5CF6, #EC4899);
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </div>
    );
};

export default SongDetails;