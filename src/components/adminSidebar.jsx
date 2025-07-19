import React, { useState, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logoImage from "../assets/images/logo.png";
import { useTranslation } from 'react-i18next';

const AdminSidebar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = localStorage.getItem('adminSidebarCollapsed');
        return savedState ? JSON.parse(savedState) : false;
    });

    useEffect(() => {
        localStorage.setItem('adminSidebarCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = async () => {
        try {
            await fetch("https://localhost:3000/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem('adminSidebarCollapsed');

            toast.success(t('Logged out successfully'), {
                position: "top-right",
                autoClose: 1500,
            });

            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error(t('Failed to logout'), {
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

    return (
        <div className={`min-h-screen flex ${i18n.language === 'ne' ? 'font-noto-sans' : ''}`}>
            <aside className={`bg-gray-800 shadow-lg rounded-3xl ml-4 mt-6 mb-7 relative transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
                <div className="relative p-4">
                    <div className="flex justify-start mb-2">
                        <button
                            onClick={toggleSidebar}
                            className="text-gray-200 hover:text-blue-400"
                        >
                            <span className="material-icons-outlined">{isCollapsed ? 'menu_open' : 'menu'}</span>
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <NavLink to="/admindash">
                            <img
                                src={logoImage}
                                alt="Anna Logo"
                                className={isCollapsed ? "w-12 h-auto" : "w-24 h-auto"}
                            />
                        </NavLink>
                    </div>
                </div>
                <nav className="mt-4">
                    <ul>
                        <li>
                            <Link
                                to="/admindash"
                                className="flex items-center p-4 text-gray-200 hover:bg-blue-900"
                            >
                                <span className="material-icons-outlined">home</span>
                                {!isCollapsed && <span className="ml-4">{t('Home')}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/addChord"
                                className="flex items-center p-4 text-gray-200 hover:bg-blue-900"
                            >
                                <span className="material-icons-outlined">queue_music</span>
                                {!isCollapsed && <span className="ml-4">{t('Add Chord')}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/addLesson"
                                className="flex items-center p-4 text-gray-200 hover:bg-blue-900"
                            >
                                <span className="material-icons-outlined">library_books</span>
                                {!isCollapsed && <span className="ml-4">{t('Add Quiz')}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/addPracticeSessions"
                                className="flex items-center p-4 text-gray-200 hover:bg-blue-900"
                            >
                                <span className="material-icons-outlined">playlist_add_check</span>
                                {!isCollapsed && <span className="ml-4">{t('Add Practice Session')}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/viewChords"
                                className="flex items-center p-4 text-gray-200 hover:bg-blue-900"
                            >
                                <span className="material-icons-outlined">visibility</span>
                                {!isCollapsed && <span className="ml-4">{t('View Chords')}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/viewLessons"
                                className="flex items-center p-4 text-gray-200 hover:bg-blue-900"
                            >
                                <span className="material-icons-outlined">visibility</span>
                                {!isCollapsed && <span className="ml-4">{t('View Quiz')}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/viewPracticeSessions"
                                className="flex items-center p-4 text-gray-200 hover:bg-blue-900"
                            >
                                <span className="material-icons-outlined">visibility</span>
                                {!isCollapsed && <span className="ml-4">{t('View Practice Sessions')}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/dashboard"
                                className="flex items-center p-4 text-gray-200 hover:bg-blue-900"
                            >
                                <span className="material-icons-outlined">dashboard</span>
                                {!isCollapsed && <span className="ml-4">{t('Dashboard')}</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className={`absolute bottom-12 ${isCollapsed ? 'left-4' : 'left-7'}`}>
                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center text-red-400 hover:text-red-600 font-medium p-3 w-full rounded-md transition duration-200 ease-in-out hover:bg-red-900"
                    >
                        <span className="material-icons-outlined">logout</span>
                        {!isCollapsed && <span className="ml-3">{t('Logout')}</span>}
                    </button>
                </div>
            </aside>

            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">
                                {t('Log out')}
                            </h3>
                            <p className="text-gray-400 mb-8 text-sm">
                                {t('Are you sure you want to log out?')}
                            </p>
                            <div className="space-y-3">
                                <button
                                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-800 transition duration-200"
                                    onClick={handleConfirmLogout}
                                >
                                    {t('Log out')}
                                </button>
                                <button
                                    className="w-full py-3 px-4 text-gray-400 hover:text-gray-200 transition duration-200"
                                    onClick={handleCancelLogout}
                                >
                                    {t('Cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSidebar;