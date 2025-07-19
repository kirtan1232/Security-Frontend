import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar.jsx";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaMusic, FaGuitar, FaPlay, FaSearch, FaFire, FaStar } from "react-icons/fa";
import { useTheme } from "../../components/ThemeContext";
import Footer from "../../components/footer.jsx";

export default function ChordAndLyric() {
    const { theme } = useTheme();
    const [songs, setSongs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("Guitar");
    const [userProfile, setUserProfile] = useState(null);
    const [likedSongs, setLikedSongs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [hoveredSong, setHoveredSong] = useState(null);
    const [showLikeAnimation, setShowLikeAnimation] = useState(null);
    const navigate = useNavigate();

    // Function to get song image using Lorem Picsum (reliable alternative)
    const getSongImage = (songName) => {
        // Create a deterministic but varied image based on song name
        const songHash = songName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const imageId = (songHash % 1000) + 1; // Ensure positive number
        
        // Use Lorem Picsum with a seeded random number for consistency
        return `https://picsum.photos/400/300?random=${imageId}`;
    };

    // Enhanced error handler for images
    const handleImageError = (e, songName) => {
        const target = e.target;
        
        // First fallback: try a different Picsum image
        if (target.src.includes('picsum.photos')) {
            const newId = Math.floor(Math.random() * 1000) + 1;
            target.src = `https://picsum.photos/400/300?random=${newId}`;
        } else {
            // Final fallback: use a beautiful SVG placeholder
            target.src = `data:image/svg+xml,${encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                    <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#grad)" />
                    <circle cx="200" cy="120" r="30" fill="white" opacity="0.9"/>
                    <text x="200" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6366f1">🎵</text>
                    <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white" opacity="0.9">
                        ${songName.slice(0, 25)}${songName.length > 25 ? '...' : ''}
                    </text>
                    <text x="200" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white" opacity="0.7">
                        Music & Chords
                    </text>
                </svg>`
            )}`;
        }
    };

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await axios.get(`https://localhost:3000/api/songs/getsongs?instrument=${selectedCategory.toLowerCase()}`);
                setSongs(response.data.songs);
            } catch (error) {
                alert("Error fetching songs: " + error.message);
            }
        };

        fetchSongs();
    }, [selectedCategory]);

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
                alert("Error fetching user profile: " + error.message);
            }
        };

        const fetchLikedSongs = async () => {
            try {
                const response = await fetch("https://localhost:3000/api/favorites/getfav", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        console.log("No liked songs found for this user.");
                        setLikedSongs([]);
                        return;
                    }
                    throw new Error("Failed to fetch liked songs");
                }

                const data = await response.json();
                setLikedSongs(data.songIds.map(song => song._id.toString()));
            } catch (error) {
                alert("Error fetching liked songs: " + error.message);
            }
        };

        fetchUserProfile();
        fetchLikedSongs();
    }, []);

    const handleLikeSong = async (songId, e) => {
        e.preventDefault();
        e.stopPropagation();

        // Show animation
        setShowLikeAnimation(songId);
        setTimeout(() => setShowLikeAnimation(null), 1000);

        try {
            console.log(`Toggling favorite for song ID: ${songId}`);
            const isLiked = likedSongs.includes(songId.toString());
            const response = await fetch(`https://localhost:3000/api/favorites/songs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ songId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to toggle favorite. Status: ${response.status}, Message: ${errorText}`);
                throw new Error(`Failed to toggle favorite: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            const updatedSongIds = data.favorite.songIds.map(id => id.toString());
            setLikedSongs(updatedSongIds);
            console.log(`Toggled favorite for song ${songId}. New likedSongs count: ${updatedSongIds.length}`);
        } catch (error) {
            console.error("Error in handleLikeSong:", error);
            alert(`Error toggling favorite: ${error.message}`);
        }
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

    const filteredSongs = songs.filter(song =>
        song.songName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSongsCount = songs.length;

    return (
        <div className={`bg-gradient-to-br min-h-screen flex flex-col ${theme === 'light' ? 'from-purple-100 via-blue-100 to-pink-100' : 'from-gray-900 via-purple-900 to-gray-800'}`}>
            <div className="relative flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 flex justify-center items-start mt-4">
                    <div className="bg-white/70 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 w-full max-w-7xl h-[85vh] overflow-y-auto">
                        
                        {/* Stats Section - Only Available Songs and Search Results */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-4 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <FaMusic className="text-2xl mr-2" />
                                    <span className="text-2xl font-bold">{totalSongsCount}</span>
                                </div>
                                <p className="text-sm opacity-90">Available Songs</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-4 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <FaSearch className="text-2xl mr-2" />
                                    <span className="text-2xl font-bold">{filteredSongs.length}</span>
                                </div>
                                <p className="text-sm opacity-90">Search Results</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-8">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <FaSearch className={`text-lg ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for songs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 text-lg transition-all duration-300 hover:shadow-lg"
                            />
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
                                        <span className="mr-2">
                                            {getInstrumentIcon(category)}
                                        </span>
                                        <span className="font-semibold">{category}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Songs Grid */}
                        <div className="space-y-4">
                            {filteredSongs.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                                        <FaMusic className="text-gray-400 text-2xl" />
                                    </div>
                                    <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
                                        {searchTerm ? "No songs found matching your search" : "No songs available in this category"}
                                    </p>
                                    {searchTerm && (
                                        <p className="text-gray-400 dark:text-gray-500">
                                            Try searching for something else
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredSongs.map((song, index) => (
                                        <Link
                                            to={`/song/${song._id}`}
                                            key={song._id}
                                            className="group relative overflow-hidden"
                                            onMouseEnter={() => setHoveredSong(song._id)}
                                            onMouseLeave={() => setHoveredSong(null)}
                                            style={{
                                                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                            }}
                                        >
                                            <div className="relative bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-700/80 dark:to-gray-800/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/30 dark:border-gray-600/30 overflow-hidden">
                                                
                                                {/* Song Image */}
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={getSongImage(song.songName)}
                                                        alt={song.songName}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        onError={(e) => handleImageError(e, song.songName)}
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                                    
                                                    {/* Like Button on Image */}
                                                    <button
                                                        onClick={(e) => handleLikeSong(song._id.toString(), e)}
                                                        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur-sm ${
                                                            likedSongs.includes(song._id.toString())
                                                                ? "bg-red-500/80 text-white"
                                                                : "bg-white/80 text-gray-700 hover:bg-red-500/80 hover:text-white"
                                                        }`}
                                                    >
                                                        {likedSongs.includes(song._id.toString()) ? (
                                                            <FaHeart className="text-sm" />
                                                        ) : (
                                                            <FaRegHeart className="text-sm" />
                                                        )}
                                                        
                                                        {/* Animation Effect */}
                                                        {showLikeAnimation === song._id && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <FaHeart className="text-red-500 text-xl animate-ping" />
                                                            </div>
                                                        )}
                                                    </button>

                                                    {/* Liked Badge */}
                                                    {likedSongs.includes(song._id.toString()) && (
                                                        <div className="absolute top-3 left-3">
                                                            <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg backdrop-blur-sm">
                                                                <FaStar className="text-xs mr-1" />
                                                                <span>Liked</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Song Info */}
                                                <div className="p-4">
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2 line-clamp-2">
                                                        {song.songName}
                                                    </h3>
                                                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                                        <FaPlay className="mr-2" />
                                                        <span>Click to view chords</span>
                                                    </div>
                                                </div>

                                                {/* Hover Effect */}
                                                {hoveredSong === song._id && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl pointer-events-none"></div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
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
                                    src="/assets/images/profile.png"
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
                
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: .5;
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
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}