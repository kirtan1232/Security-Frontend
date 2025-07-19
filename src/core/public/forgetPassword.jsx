import { useState, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logoImage from "../../assets/images/logo.png";

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Use useMemo to prevent recreation of bubbles on re-render
    const bubbles = useMemo(() => {
        const bubbleCount = 12;
        return Array.from({ length: bubbleCount }).map((_, i) => ({
            id: i,
            size: Math.random() * 40 + 20,
            left: Math.random() * 100,
            top: Math.random() * 100,
            opacity: Math.random() * 0.2 + 0.1,
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 5
        }));
    }, []); // Empty dependency array means this only runs once

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email) {
            toast.error("Please enter your email.", {
                position: "top-right",
                autoClose: 3000,
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('https://localhost:3000/api/auth/forgotPassword', { email });
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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Animated Background with three colors */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 opacity-90">
                {bubbles.map(bubble => (
                    <div 
                        key={`bubble-${bubble.id}`} // Unique key based on stable id
                        className="absolute rounded-full bg-white pointer-events-none"
                        style={{
                            width: `${bubble.size}px`,
                            height: `${bubble.size}px`,
                            left: `${bubble.left}%`,
                            top: `${bubble.top}%`,
                            opacity: bubble.opacity,
                            animation: `float ${bubble.duration}s linear ${bubble.delay}s infinite`,
                            willChange: 'transform',
                        }}
                    />
                ))}
            </div>
            
            {/* Rest of your component remains the same */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex w-full max-w-5xl min-h-[550px] relative z-10">
                {/* Left Section - Illustration */}
                <div className="w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center relative overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
                        <div className="absolute bottom-20 right-20 w-20 h-20 bg-yellow-300 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-pink-300 rounded-full"></div>
                    </div>
                    
                    {/* Logo */}
                    <div className="relative z-10 text-center">
                        <div className="bg-white bg-opacity-20 rounded-2xl p-8 mb-4 backdrop-blur-sm">
                            <img 
                                src={logoImage}
                                alt="Anna Logo" 
                                className="w-48 h-48 mx-auto object-contain"
                            />
                        </div>
                        <button
                            className="px-6 py-2 border-2 border-white rounded-full text-white text-base font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200 shadow-sm mt-6"
                            onClick={handleSignInClick}
                        >
                            SIGN IN
                        </button>
                    </div>
                </div>

                {/* Right Section - Forgot Password Form */}
                <div className="w-1/2 p-12 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-bold text-purple-800 mb-2 text-center">RESET PASSWORD</h2>
                        <p className="text-purple-600 mb-8 text-center">
                            Enter your email to receive a password reset link
                        </p>

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            {/* Email Input */}
                            <div className="relative">
                                <FontAwesomeIcon 
                                    icon={faEnvelope} 
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Reset Button */}
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="bg-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Animation definition */}
            <style jsx global>{`
                @keyframes float {
                    0% {
                        transform: translateY(0) translateX(0);
                    }
                    50% {
                        transform: translateY(-30px) translateX(15px);
                    }
                    100% {
                        transform: translateY(0) translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default ForgetPassword;