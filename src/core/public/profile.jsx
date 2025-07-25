import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../components/sidebar.jsx";
import zxcvbn from "zxcvbn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        email: "",
        about: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordScore, setPasswordScore] = useState(0);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
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

    // Security - handle password strength meter
    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
        setPasswordScore(zxcvbn(e.target.value).score);
    };

    // File upload security: only allow images, max 2MB
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Only JPG, PNG, or WEBP images are allowed.");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Profile picture must be less than 2MB.");
                return;
            }
            setImage(file);
        }
    };

    // Secure password change
    const handlePasswordChange = async () => {
        setError("");
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields", { position: "top-right", autoClose: 3000 });
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match!");
            return;
        }
        if (passwordScore < 2) {
            setError("Password is too weak! Try a mix of letters, numbers, symbols, and make it longer.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("oldPassword", oldPassword);
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
                autoClose: 1000,
                onClose: () => navigate("/dashboard")
            });
            setOldPassword("");
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

        // Input validation
        if (!user.name.trim() || !user.email.trim()) {
            toast.error("Name and email are required.", { autoClose: 3000 });
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("name", user.name.trim());
        formData.append("email", user.email.trim());
        formData.append("about", user.about.trim());
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
                autoClose: 1000,
                onClose: () => navigate("/dashboard")
            });
            setUser({
                name: data.user.name || "",
                email: data.user.email || "",
                about: data.user.about || ""
            });
            setImage(null);
            setImagePreview(data.user.profilePicture ? `https://localhost:3000/${data.user.profilePicture}` : null);
        } catch (err) {
            setError(err.message || "Error updating profile");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
                <p className="text-white text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-800 rounded-full opacity-20 animate-pulse delay-2000"></div>
            </div>

            <div className="flex flex-1 relative z-10">
                <Sidebar />
                <main className="flex-1 p-6 flex justify-center items-start mt-6">
                    <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8 w-full max-w-7xl h-[85vh] overflow-y-auto">
                        {/* Header */}
                        <header className="mb-8">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                Profile Settings
                            </h1>
                            <p className="text-gray-300 mt-1 text-lg">
                                Manage your account settings and preferences
                            </p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Profile Overview Card */}
                            <div className="bg-gray-700/50 backdrop-blur-xl rounded-2xl shadow-lg p-6 text-white">
                                <h2 className="text-xl font-semibold mb-6">Profile Overview</h2>
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative">
                                        <div
                                            onClick={() => document.getElementById("fileInput").click()}
                                            className="w-24 h-24 rounded-full bg-white flex items-center justify-center cursor-pointer border-4 border-gray-600 overflow-hidden"
                                        >
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div 
                                            className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center cursor-pointer"
                                            onClick={() => document.getElementById("fileInput").click()}
                                        >
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                            </svg>
                                        </div>
                                        <input id="fileInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </div>
                                </div>
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold">{user.name || "User"}</h3>
                                    <p className="text-gray-300 text-sm">{user.email}</p>
                                </div>
                                
                                {/* Security Settings */}
                                <div className="bg-gray-800/70 rounded-xl p-6 mb-4">
                                    <div className="flex items-center mb-4">
                                        <svg className="w-5 h-5 text-gray-300 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                                        </svg>
                                        <h4 className="text-xl font-semibold">Security Settings</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-300 mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                className="w-full p-3 rounded-lg bg-gray-600/70 text-white border border-gray-500 focus:border-purple-400 focus:outline-none"
                                                placeholder="Enter current password"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                autoComplete="current-password"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-2">New Password</label>
                                            <div className="relative group">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="w-full p-3 rounded-lg pr-10 bg-gray-600/70 text-white border border-gray-500 focus:border-purple-400 focus:outline-none"
                                                    placeholder="Enter new password"
                                                    value={newPassword}
                                                    onChange={handleNewPasswordChange}
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-purple-400 transition-colors duration-300"
                                                    tabIndex={-1}
                                                >
                                                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                            {/* Password Strength Meter */}
                                            {newPassword && (
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                passwordScore === 0 ? "w-0" :
                                                                passwordScore === 1 ? "w-1/4 bg-red-500" :
                                                                passwordScore === 2 ? "w-2/4 bg-yellow-500" :
                                                                passwordScore === 3 ? "w-3/4 bg-blue-500" :
                                                                "w-full bg-green-500"
                                                            }`}
                                                        ></div>
                                                    </div>
                                                    <p className="text-sm text-gray-300 mt-1">
                                                        Password Strength: {passwordScore === 0 ? "None" : passwordScore === 1 ? "Weak" : passwordScore === 2 ? "Fair" : passwordScore === 3 ? "Good" : "Strong"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-2">Confirm New Password</label>
                                            <div className="relative group">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="w-full p-3 rounded-lg pr-10 bg-gray-600/70 text-white border border-gray-500 focus:border-purple-400 focus:outline-none"
                                                    placeholder="Confirm new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-purple-400 transition-colors duration-300"
                                                    tabIndex={-1}
                                                >
                                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-center pt-2">
                                            <button
                                                type="button"
                                                onClick={handlePasswordChange}
                                                className="py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                        {error && <div className="text-center text-sm text-red-400 mt-2">{error}</div>}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Personal Information Card */}
                            <div className="bg-gray-700/50 backdrop-blur-xl rounded-2xl shadow-lg p-6 text-white">
                                <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
                                <p className="text-gray-300 text-sm mb-6">Your basic profile details</p>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-gray-300 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 rounded-lg bg-gray-600/70 text-white border border-gray-500 focus:border-purple-400 focus:outline-none"
                                            value={user.name}
                                            onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full p-3 rounded-lg bg-gray-600/70 text-white border border-gray-500 focus:border-purple-400 focus:outline-none"
                                            value={user.email}
                                            onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-2">About You</label>
                                        <textarea
                                            className="w-full p-3 rounded-lg bg-gray-600/70 text-white border border-gray-500 focus:border-purple-400 focus:outline-none h-32 resize-none"
                                            placeholder="Tell us about yourself, your musical background, interests..."
                                            value={user.about}
                                            onChange={(e) => setUser(prev => ({ ...prev, about: e.target.value }))}
                                        />
                                    </div>
                                    <div className="pt-4 border-t border-gray-600 flex justify-center">
                                        <button
                                            type="submit"
                                            className="py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                        >
                                            Update Profile
                                        </button>
                                    </div>
                                </form>
                                
                                {error && (
                                    <div className="mt-4 p-4 bg-red-900/50 border border-red-600 text-red-200 rounded-lg text-center">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}