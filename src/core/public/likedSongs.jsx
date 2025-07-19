import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPlay } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../../components/ThemeContext";
import Footer from "../../components/footer.jsx";

export default function LikedSongs() {
    const { theme } = useTheme();
    const [likedSongs, setLikedSongs] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

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
                throw new Error("Failed to fetch liked songs");
            }

            const data = await response.json();
            setLikedSongs(data.songIds);
        } catch (error) {
            console.error("Error fetching liked songs:", error);{   
            };
        }
    };

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

        fetchUserProfile();
        fetchLikedSongs();
    }, []);

    const handleUnlikeSong = async (songId) => {
        try {
            console.log('Unliking songId:', songId, 'Type:', typeof songId);
            setLikedSongs(prev => prev.filter(song => song._id.toString() !== songId));

            const response = await fetch(`https://localhost:3000/api/favorites/songs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ songId }),
            });

            if (!response.ok) {
                throw new Error("Failed to unlike song");
            }

            toast.success("Song unliked successfully!", {
                position: "top-right",
                autoClose: 1500,
            });

            await fetchLikedSongs();
        } catch (error) {
            toast.error("Error unliking song: " + error.message, {
                position: "top-right",
                autoClose: 3000,
            });
            await fetchLikedSongs();
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100' : 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800'}`}>
            <div className="relative flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 flex justify-center items-start mt-4">
                    <div className="bg-white bg-opacity-60 backdrop-blur-lg dark:bg-gray-800 dark:bg-opacity-80 rounded-3xl shadow-lg p-8 w-full max-w-7xl h-[85vh] overflow-y-auto">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 tracking-wide">
                            Your Liked Songs
                        </h2>
                        {likedSongs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <FontAwesomeIcon
                                    icon={faHeart}
                                    className="text-gray-400 dark:text-gray-500 text-4xl mb-4"
                                />
                                <p className="text-center text-gray-500 dark:text-gray-400 text-lg">
                                    No liked songs yet. Start exploring to add some!
                                </p>
                                <button
                                    className="mt-4 py-2 px-6 bg-gradient-to-r from-[#99CCFF] via-[#C6B7FE] to-[#766E98] text-white rounded-full hover:shadow-md transition-all duration-200"
                                    onClick={() => navigate("/chords")}
                                >
                                    Explore Songs
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {likedSongs.map((song) => (
                                    <div
                                        key={song._id}
                                        className="relative bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden cursor-pointer 
                                        hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                                        onClick={() => navigate(`/song/${song._id}`)}
                                    >
                                        <div className="overflow-hidden">
                                            <img
                                                src="src/assets/images/song-placeholder.jpg"
                                                alt={song.songName}
                                                className="w-full h-40 object-cover transition-transform duration-500 hover:scale-110"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
                                                {song.songName}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {song.artist || "Unknown Artist"}
                                            </p>
                                        </div>
                                        <div className="absolute top-2 right-2 flex space-x-2">
                                            <button
                                                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 
                                                transition-transform duration-200 hover:scale-110"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/song/${song._id}`);
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPlay}
                                                    className="text-blue-500 dark:text-blue-400 text-sm"
                                                />
                                            </button>
                                            <button
                                                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 
                                                transition-transform duration-200 hover:scale-110"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUnlikeSong(song._id.toString());
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faHeart}
                                                    className="text-red-500 dark:text-red-400 text-sm"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
                <div className="absolute top-4 right-4">
                    {userProfile && userProfile.profilePicture ? (
                        <img
                            src={`https://localhost:3000/${userProfile.profilePicture}`}
                            alt="Profile"
                            className="w-16 h-16 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer transition-transform duration-200 hover:scale-110"
                            onClick={() => navigate("/profile")}
                        />
                    ) : (
                        <img
                            src="src/assets/images/profile.png"
                            alt="Profile"
                            className="w-16 h-16 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer transition-transform duration-200 hover:scale-110"
                            onClick={() => navigate("/profile")}
                        />
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}