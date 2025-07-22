import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faEnvelope, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            toast.error("All fields are required!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        // Password length validation
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("https://localhost:3000/api/auth/register", {
                name,
                email,
                password,
                role: "user",
            });

            if (response.status === 201) {
                toast.success("User registered successfully!", {
                    position: "top-right",
                    autoClose: 1500,
                });
                navigate("/login");
            }
        } catch (err) {
            const message = err.response?.data?.message || "Error registering user. Please try again.";
            toast.error(message, {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignInClick = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
            {/* Animated background elements matching dashboard */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-800 rounded-full opacity-20 animate-pulse delay-2000"></div>
                <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-indigo-800 rounded-full opacity-15 animate-pulse delay-500"></div>
                <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-purple-700 rounded-full opacity-25 animate-pulse delay-1500"></div>
            </div>
            
            {/* Registration Container */}
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden flex w-full max-w-5xl min-h-[650px] relative z-10">
                {/* Left Section - Registration Form */}
                <div className="w-1/2 p-12 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 text-center">
                            Join Anna
                        </h2>
                        <p className="text-gray-300 mb-8 text-center text-lg">
                            Hey, Enter your details to create<br />
                            your musical account
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                                    <FontAwesomeIcon 
                                        icon={faUser} 
                                        className="text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-white bg-gray-700/90 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                                    required
                                />
                            </div>

                            {/* Email Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                                    <FontAwesomeIcon 
                                        icon={faEnvelope} 
                                        className="text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300"
                                    />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-white bg-gray-700/90 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                                    <FontAwesomeIcon 
                                        icon={faLock} 
                                        className="text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300"
                                    />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password (min 8 characters)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-14 py-4 text-white bg-gray-700/90 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-purple-400 transition-colors duration-300"
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                                    <FontAwesomeIcon 
                                        icon={faLock} 
                                        className="text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300"
                                    />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-14 py-4 text-white bg-gray-700/90 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-purple-400 transition-colors duration-300"
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>

                            {/* Register Button */}
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="group relative overflow-hidden py-4 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none w-full"
                                    disabled={loading}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative flex items-center justify-center space-x-2">
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Creating Account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Create Account</span>
                                                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-8 text-center">
                            <span className="text-gray-300">
                                Already have an account?{" "}
                                <button
                                    onClick={handleSignInClick}
                                    className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer transition-colors duration-300"
                                >
                                    Sign In
                                </button>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Section - Illustration */}
                <div className="w-1/2 bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-900 flex items-center justify-center relative overflow-hidden">
                    {/* Background decorative elements matching dashboard style */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-20 h-20 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                        <div className="absolute top-1/4 right-1/3 w-16 h-16 bg-pink-400 rounded-full animate-pulse delay-2000"></div>
                        <div className="absolute bottom-1/3 left-1/2 w-12 h-12 bg-indigo-400 rounded-full animate-pulse delay-1500"></div>
                    </div>
                    
                    {/* Logo Section */}
                    <div className="relative z-10 text-center">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-white/20 shadow-2xl">
                            <div className="w-48 h-48 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <img 
                                    src="/logo.PNG" 
                                    alt="Anna Logo" 
                                    className="w-40 h-40 object-contain filter drop-shadow-lg"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">
                                Start Your Journey
                            </h3>
                            <p className="text-gray-200 text-lg">
                                Learn music with Anna's guidance
                            </p>
                        </div>
                    </div>

                    {/* Additional decorative musical elements */}
                    <div className="absolute bottom-8 left-8 opacity-20">
                        <svg className="w-12 h-12 text-white animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                    </div>
                    
                    <div className="absolute top-8 right-8 opacity-20">
                        <svg className="w-10 h-10 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5 0h-2v6h2v-6zm3-5H3v2h1v11c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h1V6zm-2 13H5V8h14v11z"/>
                        </svg>
                    </div>

                    {/* Additional musical note decorations */}
                    <div className="absolute top-1/3 left-8 opacity-15">
                        <svg className="w-8 h-8 text-white animate-pulse delay-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                    </div>

                    <div className="absolute bottom-1/4 right-12 opacity-15">
                        <svg className="w-6 h-6 text-white animate-bounce delay-1200" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;