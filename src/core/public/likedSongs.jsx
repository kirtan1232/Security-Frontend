import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPlay } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../../components/footer.jsx";

export default function LikedSongs() {
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
                credentials: "include"
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
                    credentials: "include"
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
      
            setLikedSongs(prev => prev.filter(song => song._id.toString() !== songId));

      
            const csrfRes = await fetch("https://localhost:3000/api/csrf-token", { credentials: "include" });
            const { csrfToken } = await csrfRes.json();

            const response = await fetch(`https://localhost:3000/api/favorites/songs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "X-CSRF-Token": csrfToken
                },
                body: JSON.stringify({ songId }),
                credentials: "include"
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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-800 rounded-full opacity-20 animate-pulse delay-2000"></div>
            </div>
            
            <div className="relative flex flex-1 z-10">
                <Sidebar />
                <main className="flex-1 p-6 flex justify-center items-start mt-4">
                    <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8 w-full max-w-7xl h-[85vh] overflow-y-auto">
                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
                            Your Liked Songs
                        </h2>
                        {likedSongs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <FontAwesomeIcon
                                    icon={faHeart}
                                    className="text-gray-500 text-4xl mb-4"
                                />
                                <p className="text-center text-gray-400 text-lg">
                                    No liked songs yet. Start exploring to add some!
                                </p>
                                <button
                                    className="mt-4 py-2 px-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full hover:shadow-md transition-all duration-200"
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
                                        className="relative bg-gray-700 rounded-xl shadow-md overflow-hidden cursor-pointer 
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
                                            <h3 className="text-lg font-semibold text-gray-200 truncate">
                                                {song.songName}
                                            </h3>
                                            <p className="text-sm text-gray-400 truncate">
                                                {song.artist || "Unknown Artist"}
                                            </p>
                                        </div>
                                        <div className="absolute top-2 right-2 flex space-x-2">
                                            <button
                                                className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-gray-600 
                                                transition-transform duration-200 hover:scale-110"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/song/${song._id}`);
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPlay}
                                                    className="text-blue-400 text-sm"
                                                />
                                            </button>
                                            <button
                                                className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-gray-600 
                                                transition-transform duration-200 hover:scale-110"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUnlikeSong(song._id.toString());
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faHeart}
                                                    className="text-red-400 text-sm"
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
        </div>
    );
}