import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/ThemeContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../components/sidebar.jsx";

export default function Profile() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [user, setUser] = useState({ 
        name: "", 
        email: "", 
        about: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.warn("No token found, redirecting to login.");
                    navigate("/login");
                    return;
                }

                const response = await fetch("https://localhost:3000/api/auth/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error fetching profile:", errorData);
                    throw new Error(errorData.message || "Failed to fetch profile");
                }

                const data = await response.json();
                setUser({
                    name: data.name || "",
                    email: data.email || "",
                    about: data.about || ""
                });
                if (data.profilePicture) {
                    setImagePreview(`https://localhost:3000/${data.profilePicture}`);
                }
            } catch (error) {
                setError("Error fetching profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    useEffect(() => {
        if (image) {
            const objectUrl = URL.createObjectURL(image);
            setImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [image]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match!");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("newPassword", newPassword);

        try {
            const response = await fetch("https://localhost:3000/api/auth/update-profile", {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update password");
            }

            toast.success("Password updated successfully!", {
                position: "top-right",
                autoClose: 500,
                onClose: () => navigate("/dashboard")
            });
            setNewPassword("");
            setConfirmPassword("");
            setError("");
        } catch (err) {
            setError(err.message || "Error updating password");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("name", user.name);
        formData.append("email", user.email);
        formData.append("about", user.about);
        if (image) formData.append("profilePicture", image);

        try {
            const response = await fetch("https://localhost:3000/api/auth/update-profile", {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update profile");
            }

            const data = await response.json();
            toast.success("Profile updated successfully!", {
                position: "top-right",
                autoClose: 500,
                onClose: () => navigate("/dashboard")
            });
            setUser({
                name: data.name || "",
                email: data.email || "",
                about: data.about || ""
            });
            setImage(null);
            setImagePreview(data.profilePicture ? `https://localhost:3000/${data.profilePicture}` : null);
        } catch (err) {
            setError(err.message || "Error updating profile");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 dark:from-gray-900 via-purple-900 to-gray-800 flex items-center justify-center">
                <p className="text-white text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col min-h-screen ${theme === "light" ? "bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100" : "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800"}`}>
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Profile Settings</h1>
                        <p className="text-black dark:text-white">Manage your account settings and showcase your professional profile</p>
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profile Overview Card */}
                        <div className={`bg-white bg-opacity-60 backdrop-blur-lg dark:bg-gray-800 dark:bg-opacity-80 rounded-3xl shadow-lg p-6 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                            <h2 className="text-xl font-semibold mb-6">Profile Overview</h2>
                            
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative">
                                    <div 
                                        onClick={() => document.getElementById("fileInput").click()}
                                        className={`w-16 h-16 rounded-full bg-white flex items-center justify-center cursor-pointer border-4 ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'} overflow-hidden`}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                        </svg>
                                    </div>
                                </div>
                                <input id="fileInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold">{user.name || "User"}</h3>
                                <p className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-200'} text-sm`}>{user.email}</p>
                            </div>

                            {/* Security Settings */}
                            <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700 bg-opacity-50'} rounded-xl p-4 mb-4`}>
                                <div className="flex items-center mb-3">
                                    <svg className={`w-5 h-5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} mr-2`} fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                                    </svg>
                                    <h4 className="font-semibold">Security Settings</h4>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} mb-1`}>New Password</label>
                                        <input
                                            type="password"
                                            className={`w-full p-2 rounded-lg ${theme === 'light' ? 'bg-white text-black border-gray-300' : 'bg-gray-600 bg-opacity-50 text-white border-gray-500'} border focus:border-gray-400 focus:outline-none`}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} mb-1`}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            className={`w-full p-2 rounded-lg ${theme === 'light' ? 'bg-white text-black border-gray-300' : 'bg-gray-600 bg-opacity-50 text-white border-gray-500'} border focus:border-gray-400 focus:outline-none`}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <button 
                                            onClick={handlePasswordChange}
                                            className="max-w-sm py-2 px-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg text-sm"
                                        >
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Card */}
                        <div className={`bg-white bg-opacity-60 backdrop-blur-lg dark:bg-gray-800 dark:bg-opacity-80 rounded-3xl shadow-lg p-6 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                            <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
                            <p className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} text-sm mb-6`}>Your basic profile details</p>

                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} mb-1`}>Full Name</label>
                                    <input
                                        type="text"
                                        className={`w-full p-3 rounded-lg ${theme === 'light' ? 'bg-white text-black border-gray-300' : 'bg-gray-600 bg-opacity-50 text-white border-gray-500'} border focus:border-gray-400 focus:outline-none`}
                                        value={user.name}
                                        onChange={(e) => setUser(prev => ({...prev, name: e.target.value}))}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} mb-1`}>Email Address</label>
                                    <input
                                        type="email"
                                        className={`w-full p-3 rounded-lg ${theme === 'light' ? 'bg-white text-black border-gray-300' : 'bg-gray-600 bg-opacity-50 text-white border-gray-500'} border focus:border-gray-400 focus:outline-none`}
                                        value={user.email}
                                        onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} mb-1`}>About You</label>
                                    <textarea
                                        className={`w-full p-3 rounded-lg ${theme === 'light' ? 'bg-white text-black border-gray-300' : 'bg-gray-600 bg-opacity-50 text-white border-gray-500'} border focus:border-gray-400 focus:outline-none h-32 resize-none`}
                                        placeholder="Tell potential collaborators about your background, interests, and what you're working on..."
                                        value={user.about}
                                        onChange={(e) => setUser(prev => ({...prev, about: e.target.value}))}
                                    />
                                </div>

                                {/* Update Button */}
                                <div className="pt-4 border-t border-gray-300 dark:border-gray-600 flex justify-center">
                                    <button 
                                        onClick={handleUpdate}
                                        className="max-w-sm py-2 px-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg text-sm"
                                    >
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className={`mt-4 p-4 ${theme === 'light' ? 'bg-red-100 border-red-300 text-red-600' : 'bg-red-900 bg-opacity-50 border-red-600 text-red-200'} border rounded-lg text-center max-w-6xl mx-auto`}>
                            {error}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}