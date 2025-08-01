import { useState, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logoImage from "../../assets/images/logo.png";
import { sanitizeText } from "../../components/sanitizer"; 

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const bubbles = useMemo(() => {
        const bubbleCount = 5;
        return Array.from({ length: bubbleCount }).map((_, i) => ({
            id: i,
            size: Math.random() * 40 + 20,
            left: Math.random() * 100,
            top: Math.random() * 100,
            opacity: Math.random() * 0.2 + 0.1,
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 5
        }));
    }, []); 


    async function getFreshCsrfToken() {
        const res = await fetch("https://localhost:3000/api/csrf-token", { credentials: "include" });
        const { csrfToken } = await res.json();
        return csrfToken;
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        const safeEmail = sanitizeText(email); 

        if (!safeEmail) {
            toast.error("Please enter your email.", {
                position: "top-right",
                autoClose: 3000,
            });
            setLoading(false);
            return;
        }

        try {
            const csrfToken = await getFreshCsrfToken();
            const response = await axios.post(
                'https://localhost:3000/api/auth/forgotPassword',
                { email: safeEmail },
                {
                    headers: {
                        "X-CSRF-Token": csrfToken
                    },
                    withCredentials: true
                }
            );
            toast.success(response.data.msg, {
                position: "top-right",
                autoClose: 1500,
            });
            navigate("/login"); 
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.msg;
            if (errorMsg === "This email does not exist.") {
                toast.error("This email does not exist in our system.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                toast.error(errorMsg || "Something went wrong. Please try again.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignInClick = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {bubbles.map(bubble => (
                    <div 
                        key={`bubble-${bubble.id}`} 
                        className="absolute rounded-full bg-purple-800 opacity-20 animate-pulse"
                        style={{
                            width: `${bubble.size}px`,
                            height: `${bubble.size}px`,
                            left: `${bubble.left}%`,
                            top: `${bubble.top}%`,
                            animation: `pulse ${bubble.duration}s linear ${bubble.delay}s infinite`,
                        }}
                    />
                ))}
            </div>
            {/* Reset Container */}
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden flex w-full max-w-5xl min-h-[600px] relative z-10">
                {/* Left Section - Form */}
                <div className="w-1/2 p-12 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 text-center">
                            Forgot Password
                        </h2>
                        <p className="text-gray-300 mb-8 text-center text-lg">
                            Enter your email to receive a password reset link
                        </p>
                        <form onSubmit={handleForgotPassword} className="space-y-6">
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
                                    className="w-full pl-12 pr-14 py-4 text-white bg-gray-700/90 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                                    required
                                />
                            </div>
                            {/* Reset Button */}
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
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Reset Link</span>
                                                <svg
                                                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                    />
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
                                Remember your password?{" "}
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
            
                <div className="w-1/2 bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-20 h-20 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                        <div className="absolute top-1/4 right-1/3 w-16 h-16 bg-pink-400 rounded-full animate-pulse delay-2000"></div>
                        <div className="absolute bottom-1/3 left-1/2 w-12 h-12 bg-indigo-400 rounded-full animate-pulse delay-1500"></div>
                    </div>
                    <div className="relative z-10 text-center">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-white/20 shadow-2xl">
                            <div className="w-48 h-48 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <img
                                    src={logoImage}
                                    alt="Anna Logo"
                                    className="w-40 h-40 object-contain filter drop-shadow-lg"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">Recover Your Account</h3>
                            <p className="text-gray-200 text-lg">Reset your password with ease</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;