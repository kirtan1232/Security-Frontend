import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logoImage from "../assets/images/logo.png";
import Cookies from 'js-cookie'; // Import js-cookie library

const Sidebar = () => {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = localStorage.getItem('sidebarCollapsed');
        return savedState ? JSON.parse(savedState) : false;
    });
    const [isMobile, setIsMobile] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check both cookie and localStorage for admin role
        const roleCookie = Cookies.get('userRole');
        const localRole = localStorage.getItem("role");
        
        setIsAdmin(roleCookie === "admin" || localRole === "admin");
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Handle mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && !isCollapsed) {
                setIsCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isCollapsed]);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = async () => {
        try {
            // Server-side logout request with credentials option for cookies
            await fetch("https://localhost:3000/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                credentials: 'include', // Important for cookie operations
            });

            // Clear localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem('sidebarCollapsed');
            
            // Explicitly clear cookies using js-cookie library
            Cookies.remove('authToken', { path: '/' });
            Cookies.remove('userRole', { path: '/' });
            
            // Alternative approach to clear cookies if js-cookie doesn't work
            document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            toast.success('Logged out successfully', {
                position: "top-right",
                autoClose: 1500,
            });

            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error('Failed to logout', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setShowLogoutConfirm(false);
        }
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handleSupportUsClick = () => {
        navigate("/payment");
    };

    const handleAdminDashboardClick = () => {
        toast.success('You are in AdminDashboard.', {
            position: "top-right",
            autoClose: 1500,
        });
        navigate("/admindash");
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Fancy custom SVG icons
    const HomeIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );

    const LessonsIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.832 18.477 19.247 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    );

    const PracticeIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const ChordsIcon = () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 15.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            <circle cx="17" cy="6" r="1"/>
        </svg>
    );

    const TunerIcon = () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h2v8H3v-8zM7 9h2v12H7V9zM11 5h2v16h-2V5zM15 9h2v12h-2V9zM19 13h2v8h-2v-8z"/>
        </svg>
    );

    const HeartIcon = () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
    );

    const SupportIcon = () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.38 0 2.5-1.12 2.5-2.5S19.88 5 18.5 5V3zM16 10c0 2.76-2.24 5-5 5s-5-2.24-5-5V5h10v5zM18.5 7H18V6.5h.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
            <path d="M7 2h1v2H7zm3-1h1v2h-1zm3 1h1v2h-1z"/>
        </svg>
    );

    const AdminIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );

    const LogoutIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    );

    const MenuIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );

    const MenuOpenIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    return (
        <div className="min-h-screen flex">
            <aside className={`bg-gray-800/90 backdrop-blur-xl shadow-2xl rounded-3xl relative transition-all duration-300 border border-gray-700/50 flex flex-col ${
                isCollapsed 
                    ? 'w-20 ml-2 mt-2 mb-2' 
                    : 'w-72 ml-4 mt-6 mb-7'
            } ${isMobile ? 'fixed z-50 h-screen' : ''}`}>
                
                {/* Toggle Button */}
                <div className="p-4 flex-shrink-0">
                    <div className="flex justify-start mb-2">
                    <button
                        onClick={toggleSidebar}
                        className="group relative overflow-hidden p-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 rounded-xl text-gray-200 hover:text-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-gray-600/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                            <MenuIcon />
                        </div>
                    </button>
                    </div>
                    
                    {/* Logo */}
                    <div className="flex justify-center">
                        <Link to="/dashboard" className="group">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20 group-hover:border-white/40 transition-all duration-300 group-hover:scale-105">
                                <img
                                    src={logoImage}
                                    alt="Anna Logo"
                                    className={`object-contain filter drop-shadow-lg transition-all duration-300 ${
                                        isCollapsed ? "w-10 h-10" : "w-32 h-auto"
                                    }`}
                                />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 px-2 overflow-y-auto scrollbar-hide">
                    <ul className="space-y-1 pb-4">
                        <li>
                            <Link
                                to="/dashboard"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500/30 to-purple-600/30 group-hover:from-blue-500/50 group-hover:to-purple-600/50 transition-all duration-300 flex-shrink-0">
                                    <HomeIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Home</span>}
                            </Link>
                        </li>
                        
                        <li>
                            <Link
                                to="/lesson"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-emerald-500/30 to-teal-600/30 group-hover:from-emerald-500/50 group-hover:to-teal-600/50 transition-all duration-300 flex-shrink-0">
                                    <LessonsIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Lessons</span>}
                            </Link>
                        </li>
                        
                        <li>
                            <Link
                                to="/practiceSessions"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-pink-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-orange-500/30 to-pink-600/30 group-hover:from-orange-500/50 group-hover:to-pink-600/50 transition-all duration-300 flex-shrink-0">
                                    <PracticeIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Practice Sessions</span>}
                            </Link>
                        </li>
                        
                        <li>
                            <Link
                                to="/chords"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-indigo-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-purple-500/30 to-indigo-600/30 group-hover:from-purple-500/50 group-hover:to-indigo-600/50 transition-all duration-300 flex-shrink-0">
                                    <ChordsIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Chords & Lyrics</span>}
                            </Link>
                        </li>
                        
                        <li>
                            <Link
                                to="/tuner"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-600/30 group-hover:from-cyan-500/50 group-hover:to-blue-600/50 transition-all duration-300 flex-shrink-0">
                                    <TunerIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Tuner</span>}
                            </Link>
                        </li>
                        
                        <li>
                            <Link
                                to="/liked-songs"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-rose-500/20 hover:to-red-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-rose-500/30 to-red-600/30 group-hover:from-rose-500/50 group-hover:to-red-600/50 transition-all duration-300 flex-shrink-0">
                                    <HeartIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Liked Songs</span>}
                            </Link>
                        </li>
                        
                        <li>
                            <button
                                onClick={handleSupportUsClick}
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1 w-full text-left"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-amber-500/30 to-yellow-600/30 group-hover:from-amber-500/50 group-hover:to-yellow-600/50 transition-all duration-300 flex-shrink-0">
                                    <SupportIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Support Us</span>}
                            </button>
                        </li>
                        
                        {isAdmin && (
                            <li>
                                <button
                                    onClick={handleAdminDashboardClick}
                                    className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-purple-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1 w-full text-left"
                                >
                                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-violet-500/30 to-purple-600/30 group-hover:from-violet-500/50 group-hover:to-purple-600/50 transition-all duration-300 flex-shrink-0">
                                        <AdminIcon />
                                    </div>
                                    {!isCollapsed && <span className="ml-3 font-medium text-sm">Admin Dashboard</span>}
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Logout Button - Fixed at bottom with more space */}
                <div className="flex-shrink-0 p-4 border-t border-gray-700/50">
                    <button
                        onClick={handleLogoutClick}
                        className="group flex items-center text-red-400 hover:text-red-300 font-medium p-3 w-full rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-600/20 border border-transparent hover:border-red-600/30 hover:shadow-lg transform hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-red-500/30 to-pink-600/30 group-hover:from-red-500/50 group-hover:to-pink-600/50 transition-all duration-300 flex-shrink-0">
                            <LogoutIcon />
                        </div>
                        {!isCollapsed && <span className="ml-3 font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobile && !isCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={toggleSidebar}
                />
            )}

            {/* Enhanced Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-gray-800/95 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-700/50 transform animate-in fade-in duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogoutIcon />
                            </div>
                            <h3 className="text-xl font-bold text-gray-200 mb-2">
                                Confirm Logout
                            </h3>
                            <p className="text-gray-400 mb-6 text-sm">
                                Are you sure you want to log out? You'll need to sign in again to access your account.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    className="flex-1 py-3 px-4 bg-gray-700 text-gray-200 rounded-xl hover:bg-gray-600 font-medium transition-all duration-300 transform hover:-translate-y-1 text-sm"
                                    onClick={handleCancelLogout}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
                                    onClick={handleConfirmLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom scrollbar styles */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default Sidebar;