import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logoImage from "../assets/images/logo.png";
import Cookies from 'js-cookie';

const Header = () => {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        
        const roleCookie = Cookies.get('userRole');
        setIsAdmin(roleCookie === "admin");
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileMenuOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = async () => {
        try {
          
            const response = await fetch("https://localhost:3000/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": Cookies.get('csrfToken')
                },
                credentials: 'include',
            });

            if (response.ok) {
               
                Cookies.remove('authToken', { path: '/' });
                Cookies.remove('userRole', { path: '/' });
                Cookies.remove('csrfToken', { path: '/' });

             
                document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "csrfToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                toast.success('Logged out successfully', {
                    position: "top-right",
                    autoClose: 1500,
                });

                navigate("/login");
            } else {
                throw new Error('Logout failed');
            }
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
        // Check for admin cookie before redirect
        const roleCookie = Cookies.get('userRole');
        if (roleCookie === "admin") {
            toast.success('You are in AdminDashboard.', {
                position: "top-right",
                autoClose: 1500,
            });
            navigate("/admindash");
        } else {
            toast.error('You are not authorized.', {
                position: "top-right",
                autoClose: 2500,
            });
            navigate("/login");
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

  
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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );

    const CloseIcon = () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    return (
        <>
            {/* Header */}
            <header className="bg-gray-800/90 backdrop-blur-xl shadow-2xl border-b border-gray-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-4">
                            <Link to="/dashboard" className="group">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 group-hover:border-white/40 transition-all duration-300 group-hover:scale-105">
                                    <img
                                        src={logoImage}
                                        alt="Anna Logo"
                                        className="w-8 h-8 object-contain filter drop-shadow-lg transition-all duration-300"
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            <Link
                                to="/dashboard"
                                className="group flex items-center px-3 py-2 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20"
                            >
                                <div className="flex items-center justify-center w-5 h-5 mr-2">
                                    <HomeIcon />
                                </div>
                                <span className="font-medium text-sm">Home</span>
                            </Link>
                            
                            <Link
                                to="/lesson"
                                className="group flex items-center px-3 py-2 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-600/20"
                            >
                                <div className="flex items-center justify-center w-5 h-5 mr-2">
                                    <LessonsIcon />
                                </div>
                                <span className="font-medium text-sm">Lessons</span>
                            </Link>
                            
                            <Link
                                to="/practiceSessions"
                                className="group flex items-center px-3 py-2 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-pink-600/20"
                            >
                                <div className="flex items-center justify-center w-5 h-5 mr-2">
                                    <PracticeIcon />
                                </div>
                                <span className="font-medium text-sm">Practice</span>
                            </Link>
                            
                            <Link
                                to="/chords"
                                className="group flex items-center px-3 py-2 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-indigo-600/20"
                            >
                                <div className="flex items-center justify-center w-5 h-5 mr-2">
                                    <ChordsIcon />
                                </div>
                                <span className="font-medium text-sm">Chords</span>
                            </Link>
                            
                        
                            
                            <Link
                                to="/liked-songs"
                                className="group flex items-center px-3 py-2 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-rose-500/20 hover:to-red-600/20"
                            >
                                <div className="flex items-center justify-center w-5 h-5 mr-2">
                                    <HeartIcon />
                                </div>
                                <span className="font-medium text-sm">Liked</span>
                            </Link>
                            
                            <button
                                onClick={handleSupportUsClick}
                                className="group flex items-center px-3 py-2 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-600/20"
                            >
                                <div className="flex items-center justify-center w-5 h-5 mr-2">
                                    <SupportIcon />
                                </div>
                                <span className="font-medium text-sm">Support</span>
                            </button>
                            
                            {isAdmin && (
                                <button
                                    onClick={handleAdminDashboardClick}
                                    className="group flex items-center px-3 py-2 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-purple-600/20"
                                >
                                    <div className="flex items-center justify-center w-5 h-5 mr-2">
                                        <AdminIcon />
                                    </div>
                                    <span className="font-medium text-sm">Admin</span>
                                </button>
                            )}
                        </nav>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-4">
                            {/* Logout button for desktop */}
                            <button
                                onClick={handleLogoutClick}
                                className="hidden md:flex group items-center px-3 py-2 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-600/20"
                            >
                                <div className="flex items-center justify-center w-5 h-5 mr-2">
                                    <LogoutIcon />
                                </div>
                                <span className="font-medium text-sm">Logout</span>
                            </button>

                            {/* Mobile menu button */}
                            <button
                                onClick={toggleMobileMenu}
                                className="md:hidden p-2 text-gray-200 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300"
                            >
                                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-gray-800/95 backdrop-blur-xl border-t border-gray-700/50">
                        <div className="px-4 py-2 space-y-1">
                            <Link
                                to="/dashboard"
                                className="flex items-center px-3 py-3 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <HomeIcon />
                                <span className="ml-3 font-medium">Home</span>
                            </Link>
                            
                            <Link
                                to="/lesson"
                                className="flex items-center px-3 py-3 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-600/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <LessonsIcon />
                                <span className="ml-3 font-medium">Lessons</span>
                            </Link>
                            
                            <Link
                                to="/practiceSessions"
                                className="flex items-center px-3 py-3 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-pink-600/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <PracticeIcon />
                                <span className="ml-3 font-medium">Practice Sessions</span>
                            </Link>
                            
                            <Link
                                to="/chords"
                                className="flex items-center px-3 py-3 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-indigo-600/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <ChordsIcon />
                                <span className="ml-3 font-medium">Chords & Lyrics</span>
                            </Link>
                            
                          
                            
                            <Link
                                to="/liked-songs"
                                className="flex items-center px-3 py-3 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-rose-500/20 hover:to-red-600/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <HeartIcon />
                                <span className="ml-3 font-medium">Liked Songs</span>
                            </Link>
                            
                            <button
                                onClick={() => {
                                    handleSupportUsClick();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-3 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-600/20"
                            >
                                <SupportIcon />
                                <span className="ml-3 font-medium">Support Us</span>
                            </button>
                            
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        handleAdminDashboardClick();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center w-full px-3 py-3 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-purple-600/20"
                                >
                                    <AdminIcon />
                                    <span className="ml-3 font-medium">Admin Dashboard</span>
                                </button>
                            )}
                            
                            <button
                                onClick={handleLogoutClick}
                                className="flex items-center w-full px-3 py-3 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-600/20 border-t border-gray-700/50 mt-2 pt-4"
                            >
                                <LogoutIcon />
                                <span className="ml-3 font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>

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
        </>
    );
};

export default Header;