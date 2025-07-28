import React, { useState, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logoImage from "../assets/images/logo.png";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cookies from 'js-cookie';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false); // No localStorage
    const [isMobile, setIsMobile] = useState(false);

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
                    "Content-Type": "application/json"
                },
                credentials: 'include',
            });

            // Explicitly clear cookies using js-cookie library
            Cookies.remove('authToken', { path: '/' });
            Cookies.remove('userRole', { path: '/' });
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

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Fancy custom SVG icons for admin functions
    const AdminHomeIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );

    const AddChordIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );

    const AddQuizIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        </svg>
    );

    const AddPracticeIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            <circle cx="12" cy="12" r="2"/>
        </svg>
    );

    const ViewIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );

    const DashboardIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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

    return (
        <div className="min-h-screen flex">
            <aside className={`bg-gray-800/90 backdrop-blur-xl shadow-2xl rounded-3xl relative transition-all duration-300 border border-gray-700/50 flex flex-col ${
                isCollapsed 
                    ? 'w-20 ml-2 mt-2 mb-2' 
                    : 'w-72 ml-4 mt-6 mb-7'
            } ${isMobile ? 'fixed z-50 h-screen' : ''}`}>
                
                {/* Toggle Button & Logo */}
                <div className="p-4 flex-shrink-0">
                    <div className="flex justify-start mb-2">
                        <button
                            onClick={toggleSidebar}
                            className="group relative overflow-hidden p-2 bg-gradient-to-r from-purple-500/20 to-indigo-600/20 hover:from-purple-500/30 hover:to-indigo-600/30 rounded-xl text-gray-200 hover:text-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-gray-600/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                <MenuIcon />
                            </div>
                        </button>
                    </div>
                    
                    {/* Logo with Admin Badge */}
                    <div className="flex justify-center">
                        <NavLink to="/admindash" className="group relative">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-purple-500/30 group-hover:border-purple-400/50 transition-all duration-300 group-hover:scale-105">
                                <img
                                    src={logoImage}
                                    alt="Anna Admin Logo"
                                    className={`object-contain filter drop-shadow-lg transition-all duration-300 ${
                                        isCollapsed ? "w-10 h-10" : "w-32 h-auto"
                                    }`}
                                />
                                {!isCollapsed && (
                                    <div className="mt-2 text-center">
                                        <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full text-xs font-semibold text-white">
                                            ADMIN
                                        </span>
                                    </div>
                                )}
                            </div>
                        </NavLink>
                    </div>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 px-2 overflow-y-auto scrollbar-hide">
                    <ul className="space-y-1 pb-4">
                        {/* Admin Home */}
                        <li>
                            <Link
                                to="/admindash"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-indigo-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-purple-500/30 to-indigo-600/30 group-hover:from-purple-500/50 group-hover:to-indigo-600/50 transition-all duration-300 flex-shrink-0">
                                    <AdminHomeIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Admin Home</span>}
                            </Link>
                        </li>

                        {/* Add Section */}
                        {!isCollapsed && (
                            <li className="px-3 py-2">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Add Content
                                </h3>
                            </li>
                        )}
                        
                        <li>
                            <Link
                                to="/addChord"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-emerald-500/30 to-teal-600/30 group-hover:from-emerald-500/50 group-hover:to-teal-600/50 transition-all duration-300 flex-shrink-0">
                                    <AddChordIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Add Chord</span>}
                            </Link>
                        </li>
                        
                        <li>
                            <Link
                                to="/addLesson"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-600/30 group-hover:from-blue-500/50 group-hover:to-cyan-600/50 transition-all duration-300 flex-shrink-0">
                                    <AddQuizIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Add Quiz</span>}
                            </Link>
                        </li>
                        
                        <li>
                            <Link
                                to="/addPracticeSessions"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-pink-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-orange-500/30 to-pink-600/30 group-hover:from-orange-500/50 group-hover:to-pink-600/50 transition-all duration-300 flex-shrink-0">
                                    <AddPracticeIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Add Practice Session</span>}
                            </Link>
                        </li>

                        {/* View Section */}
                        {!isCollapsed && (
                            <li className="px-3 py-2 pt-4">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    View & Manage
                                </h3>
                            </li>
                        )}
                        
                        <li>
                            <Link
                                to="/viewChords"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-purple-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-violet-500/30 to-purple-600/30 group-hover:from-violet-500/50 group-hover:to-purple-600/50 transition-all duration-300 flex-shrink-0">
                                    <ViewIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">View Chords</span>}
                            </Link>
                        </li>
                        
                        <li>
                            <Link
                                to="/viewLessons"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-rose-500/20 hover:to-red-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-rose-500/30 to-red-600/30 group-hover:from-rose-500/50 group-hover:to-red-600/50 transition-all duration-300 flex-shrink-0">
                                    <ViewIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">View Quiz</span>}
                            </Link>
                        </li>
                        
                        <li>
                            <Link
                                to="/viewPracticeSessions"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-amber-500/30 to-yellow-600/30 group-hover:from-amber-500/50 group-hover:to-yellow-600/50 transition-all duration-300 flex-shrink-0">
                                    <ViewIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">View Practice Sessions</span>}
                            </Link>
                        </li>

                        {/* User Dashboard */}
                        {!isCollapsed && (
                            <li className="px-3 py-2 pt-4">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    User View
                                </h3>
                            </li>
                        )}
                        
                        <li>
                            <Link
                                to="/dashboard"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-blue-600/20 border border-transparent hover:border-gray-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-indigo-500/30 to-blue-600/30 group-hover:from-indigo-500/50 group-hover:to-blue-600/50 transition-all duration-300 flex-shrink-0">
                                    <DashboardIcon />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">User Dashboard</span>}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/auditlog"
                                className="group flex items-center p-3 text-gray-200 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-600/20 border border-transparent hover:border-cyan-600/30 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-600/30 group-hover:from-cyan-500/50 group-hover:to-blue-600/50 transition-all duration-300 flex-shrink-0">
                                    <FontAwesomeIcon icon={faClipboardList} />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Audit Log</span>}
                            </Link>
                        </li>
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
                                Admin Logout
                            </h3>
                            <p className="text-gray-400 mb-6 text-sm">
                                Are you sure you want to log out from the admin panel? You'll need to sign in again to access admin features.
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

export default AdminSidebar;