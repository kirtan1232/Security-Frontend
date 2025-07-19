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

    const bubbles = useMemo(() => {
        const bubbleCount = 15;
        return Array.from({ length: bubbleCount }).map((_, i) => ({
            id: i,
            size: Math.random() * 60 + 20,
            left: Math.random() * 100,
            top: Math.random() * 100,
            opacity: Math.random() * 0.3 + 0.1,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5
        }));
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Updated Background with stable bubbles */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 opacity-90">
                {bubbles.map(bubble => (
                    <div 
                        key={`bubble-${bubble.id}`}
                        className="absolute rounded-full bg-white pointer-events-none"
                        style={{
                            width: `${bubble.size}px`,
                            height: `${bubble.size}px`,
                            left: `${bubble.left}%`,
                            top: `${bubble.top}%`,
                            opacity: bubble.opacity,
                            animation: `float ${bubble.duration}s ease-in-out ${bubble.delay}s infinite`,
                            willChange: 'transform',
                        }}
                    />
                ))}
            </div>
            
            {/* Registration Container */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex w-full max-w-5xl min-h-[550px] relative z-10">
                {/* Left Section - Registration Form */}
                <div className="w-1/2 p-12 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-bold text-purple-800 mb-2 text-center">CREATE ACCOUNT</h2>
                        <p className="text-purple-600 mb-8 text-center">
                            Hey, Enter your details to create<br />
                            your account
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Input */}
                            <div className="relative">
                                <FontAwesomeIcon 
                                    icon={faUser} 
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>

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
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 foci:border-transparent"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <FontAwesomeIcon 
                                    icon={faLock} 
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="relative">
                                <FontAwesomeIcon 
                                    icon={faLock} 
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>

                            {/* Register Button */}
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="bg-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    disabled={loading}
                                >
                                    {loading ? "Registering..." : "Register Now"}
                                </button>
                            </div>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-6 text-center">
                            <span className="text-gray-600 text-sm">
                                Already have an account?{" "}
                                <button
                                    onClick={handleSignInClick}
                                    className="text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
                                >
                                    Login
                                </button>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Section - Illustration */}
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
                                src="/logo.PNG" 
                                alt="Anna Logo" 
                                className="w-48 h-48 mx-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add the floating animation */}
            <style jsx>{`
                @keyframes float {
                    0% {
                        transform: translateY(0) translateX(0);
                    }
                    50% {
                        transform: translateY(-100px) translateX(20px);
                    }
                    100% {
                        transform: translateY(0) translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;