import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/adminSidebar.jsx";
import { useTheme } from "../../components/ThemeContext";
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBook, faMusic, faDonate, faChartLine, faEye, faFire ,faUsers} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [state, setState] = useState({
        userProfile: null,
        totalUsers: 0,
        totalLessons: 0,
        totalSongs: 0,
        totalDonations: 0,
        usersData: [],
        lessonsData: [],
        songsData: [],
        supportData: [],
        error: null,
        isLoaded: false,
        isLoading: false
    });

    const fetchWithToken = useCallback(async (url, errorMessage) => {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error(`${t('Error')}: ${t('No token found, please log in again')}`);
        }
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`${t('Error')}: ${errorMessage}`);
        }
        return response.json();
    }, [t]);

    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const [profileData, usersData, lessonsData, songsData, supportData] = await Promise.all([
                fetchWithToken("https://localhost:3000/api/auth/profile", "Failed to fetch profile"),
                fetchWithToken("https://localhost:3000/api/auth/users", "Failed to fetch users"),
                fetchWithToken("https://localhost:3000/api/quiz/getAllQuizzes", "Failed to fetch lessons"),
                fetchWithToken("https://localhost:3000/api/songs/getsongs", "Failed to fetch songs"),
                fetchWithToken("https://localhost:3000/api/support", "Failed to fetch support records")
            ]);

            setState(prev => ({
                ...prev,
                userProfile: profileData,
                usersData: Array.isArray(usersData) ? usersData : [],
                totalUsers: Array.isArray(usersData) ? usersData.length : 0,
                lessonsData: Array.isArray(lessonsData) ? lessonsData : [],
                totalLessons: Array.isArray(lessonsData) ? lessonsData.length : 0,
                songsData: songsData.songs ? songsData.songs : Array.isArray(songsData) ? songsData : [],
                totalSongs: songsData.songs ? songsData.songs.length : Array.isArray(songsData) ? songsData.length : 0,
                supportData: Array.isArray(supportData.supportRecords) ? supportData.supportRecords : [],
                totalDonations: Array.isArray(supportData.supportRecords) 
                    ? supportData.supportRecords.reduce((sum, record) => sum + (record.amount || 0), 0)
                    : 0,
                isLoaded: true,
                isLoading: false
            }));
        } catch (error) {
            console.error("Error fetching data:", error.message);
            setState(prev => ({ ...prev, error: error.message, isLoading: false }));
            if (error.message.includes('No token found')) {
                navigate("/login");
            }
        }
    }, [fetchWithToken, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const processLineChartData = useCallback(() => {
        const isValidDate = (dateStr) => dateStr && !isNaN(new Date(dateStr).getTime());

        const allDates = [
            ...state.usersData.filter(item => isValidDate(item.createdAt))
                .map(item => new Date(item.createdAt).toISOString().split('T')[0]),
            ...state.lessonsData.filter(item => isValidDate(item.createdAt))
                .map(item => new Date(item.createdAt).toISOString().split('T')[0]),
            ...state.songsData.filter(item => isValidDate(item.createdAt))
                .map(item => new Date(item.createdAt).toISOString().split('T')[0]),
        ].sort();

        const uniqueDates = [...new Set(allDates)];

        const usersCounts = uniqueDates.map(date => 
            state.usersData.filter(item => 
                isValidDate(item.createdAt) && 
                new Date(item.createdAt).toISOString().split('T')[0] <= date
            ).length
        );

        const lessonsCounts = uniqueDates.map(date => 
            state.lessonsData.filter(item => 
                isValidDate(item.createdAt) && 
                new Date(item.createdAt).toISOString().split('T')[0] <= date
            ).length
        );

        const songsCounts = uniqueDates.map(date => 
            state.songsData.filter(item => 
                isValidDate(item.createdAt) && 
                new Date(item.createdAt).toISOString().split('T')[0] <= date
            ).length
        );

        return {
            labels: uniqueDates,
            datasets: [
                {
                    label: t('Total Users'),
                    data: usersCounts,
                    borderColor: 'rgba(139, 92, 246, 1)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    borderWidth: 3,
                },
                {
                    label: t('Total Lessons'),
                    data: lessonsCounts,
                    borderColor: 'rgba(251, 146, 60, 1)',
                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(251, 146, 60, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(251, 146, 60, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    borderWidth: 3,
                },
                {
                    label: t('Total Songs'),
                    data: songsCounts,
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    borderWidth: 3,
                },
            ],
        };
    }, [state.usersData, state.lessonsData, state.songsData, t]);

    const doughnutChartData = {
        labels: [t('Total Users'), t('Total Lessons'), t('Total Songs')],
        datasets: [{
            label: t('Metrics'),
            data: [state.totalUsers, state.totalLessons, state.totalSongs],
            backgroundColor: [
                'rgba(139, 92, 246, 0.8)',
                'rgba(251, 146, 60, 0.8)',
                'rgba(34, 197, 94, 0.8)'
            ],
            borderColor: [
                'rgba(139, 92, 246, 1)',
                'rgba(251, 146, 60, 1)',
                'rgba(34, 197, 94, 1)'
            ],
            borderWidth: 3,
            hoverOffset: 15,
        }],
    };

    const chartOptions = {
        line: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: theme === 'dark' ? '#e5e7eb' : '#374151',
                        padding: 20,
                        font: { size: 14, weight: 'bold' },
                    },
                },
                title: {
                    display: true,
                    text: t('Cumulative Metrics Over Time'),
                    color: theme === 'dark' ? '#e5e7eb' : '#374151',
                    font: { size: 18, weight: 'bold' },
                    padding: 20,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: theme === 'dark' ? '#e5e7eb' : '#374151', font: { size: 12 } },
                    grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
                },
                x: {
                    ticks: { 
                        color: theme === 'dark' ? '#e5e7eb' : '#374151',
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 12 }
                    },
                    grid: { display: false },
                },
            },
            interaction: { intersect: false, mode: 'index' },
        },
        doughnut: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: theme === 'dark' ? '#e5e7eb' : '#374151',
                        padding: 20,
                        font: { size: 14, weight: 'bold' },
                    },
                },
                title: {
                    display: true,
                    text: t('Dashboard Metrics Distribution'),
                    color: theme === 'dark' ? '#e5e7eb' : '#374151',
                    font: { size: 18, weight: 'bold' },
                    padding: 20,
                },
            },
            animation: { animateRotate: true, animateScale: true },
        }
    };

    const CountUpAnimation = ({ end, duration = 2000 }) => {
        const [count, setCount] = useState(0);
        
        useEffect(() => {
            if (end === 0) return;
            let startTime = null;
            const startCount = 0;
            
            const animate = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const progress = Math.min((currentTime - startTime) / duration, 1);
                setCount(Math.floor(progress * (end - startCount) + startCount));
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        }, [end, duration]);
        
        return count;
    };

    CountUpAnimation.propTypes = {
        end: PropTypes.number.isRequired,
        duration: PropTypes.number
    };

    const getTitleStyles = (title) => {
        switch (title) {
            case t('Total Users'):
                return { textColor: '#8b5cf6', borderColor: '#8b5cf6' }; // Purple
            case t('Total Lessons'):
                return { textColor: '#fb923c', borderColor: '#fb923c' }; // Orange
            case t('Total Songs'):
                return { textColor: '#22c55e', borderColor: '#22c55e' }; // Green
            case t('Total Donations'):
                return { textColor: '#ec4899', borderColor: '#ec4899' }; // Pink
            default:
                return { textColor: '#ffffff', borderColor: '#ffffff' }; // Default white
        }
    };

    const StatCard = ({ icon, title, value, loading, gradient, delay }) => (
        <div 
            className={`relative h-48 rounded-2xl overflow-hidden ${gradient} shadow-2xl transform transition-all duration-700 ${
                state.isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ 
                transitionDelay: `${delay}ms`,
                background: `linear-gradient(135deg, ${gradient})`,
                border: `2px solid ${getTitleStyles(title).borderColor}`
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-white">
                <FontAwesomeIcon icon={icon} className="text-4xl md:text-5xl mb-4 drop-shadow-lg" />
                <h2 className="text-lg md:text-xl font-bold mb-2 text-center" style={{ color: getTitleStyles(title).textColor }}>
                    {title}
                </h2>
                <div className="text-3xl md:text-4xl font-bold">
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-8 bg-white/30 rounded w-16"></div>
                        </div>
                    ) : (
                        <span className="drop-shadow-lg">
                            {typeof value === 'string' && value.includes('Rs') ? 
                                value : <CountUpAnimation end={value} />
                            }
                        </span>
                    )}
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>
    );

    StatCard.propTypes = {
        icon: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        loading: PropTypes.bool.isRequired,
        gradient: PropTypes.string.isRequired,
        delay: PropTypes.number.isRequired
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 flex flex-col md:flex-row overflow-hidden ${t('language') === 'ne' ? 'font-noto-sans' : ''}`}>
            <AdminSidebar />
            <main className="flex-1 p-4 md:p-6 flex justify-center items-start mt-4 md:mt-6">
                <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-[95vw] md:max-w-[90vw] max-h-[90vh] overflow-y-auto border border-white/20">
                    <header className={`flex flex-col md:flex-row justify-between items-center mb-8 transition-all duration-1000 ${
                        state.isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                    }`}>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                {t('Admin Dashboard')}
                            </h1>
                            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('Welcome back')}</p>
                                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {state.userProfile ? state.userProfile.name : t('Admin')}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="text-white text-xl" />
                            </div>
                        </div>
                    </header>

                    {state.error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faFire} className="mr-2" />
                                {t('Error')}: {state.error}
                            </div>
                        </div>
                    )}

                    {state.isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    icon={faUsers}
                                    title={t('Total Users')}
                                    value={state.totalUsers}
                                    loading={state.isLoading}
                                    gradient="from-purple-500 to-purple-700"
                                    delay={100}
                                />
                                <StatCard
                                    icon={faBook}
                                    title={t('Total Lessons')}
                                    value={state.totalLessons}
                                    loading={state.isLoading}
                                    gradient="from-orange-500 to-red-600"
                                    delay={200}
                                />
                                <StatCard
                                    icon={faMusic}
                                    title={t('Total Songs')}
                                    value={state.totalSongs}
                                    loading={state.isLoading}
                                    gradient="from-green-500 to-emerald-600"
                                    delay={300}
                                />
                                <StatCard
                                    icon={faDonate}
                                    title={t('Total Donations')}
                                    value={`${t('Rs')} ${state.totalDonations}`}
                                    loading={state.isLoading}
                                    gradient="from-pink-500 to-rose-600"
                                    delay={400}
                                />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                                <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 transition-all duration-1000 ${
                                    state.isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                                }`} style={{ transitionDelay: '600ms' }}>
                                    <div className="flex items-center mb-4">
                                        <FontAwesomeIcon icon={faChartLine} className="text-2xl text-purple-600 mr-3" />
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('Growth Analytics')}</h3>
                                    </div>
                                    <div className="h-80">
                                        {(state.usersData.length > 0 || state.lessonsData.length > 0 || state.songsData.length > 0) ? (
                                            <Line data={processLineChartData()} options={chartOptions.line} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <FontAwesomeIcon icon={faChartLine} className="text-4xl text-gray-400 mb-4" />
                                                    <p className="text-gray-600 dark:text-gray-400">{t('No data available for line chart')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 transition-all duration-1000 ${
                                    state.isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                                }`} style={{ transitionDelay: '700ms' }}>
                                    <div className="flex items-center mb-4">
                                        <FontAwesomeIcon icon={faEye} className="text-2xl text-blue-600 mr-3" />
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('Distribution Overview')}</h3>
                                    </div>
                                    <div className="h-80">
                                        <Doughnut data={doughnutChartData} options={chartOptions.doughnut} />
                                    </div>
                                </div>
                            </div>

                            <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 transition-all duration-1000 ${
                                state.isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`} style={{ transitionDelay: '800ms' }}>
                                <div className="flex items-center mb-4">
                                    <FontAwesomeIcon icon={faChartLine} className="text-2xl text-green-600 mr-3" />
                                    <h3 className="text-xl  font-bold text-gray-800 dark:text-gray-200">{t('Calendar View')}</h3>
                                </div>
                                <div className="calendar-container">
                                    <style jsx>{`
                                        .calendar-container .react-calendar {
                                            width: 100%;
                                            background: transparent;
                                            border: none;
                                            font-family: inherit;
                                            line-height: 1.125em;
                                            color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
                                        }
                                        .calendar-container .react-calendar__tile {
                                            padding: 10px 6px;
                                            background: none;
                                            text-align: center;
                                            font-size: 14px;
                                            font-weight: 500;
                                            border-radius: 8px;
                                            transition: all 0.2s ease;
                                        }
                                        .calendar-container .react-calendar__tile:enabled:hover,
                                        .calendar-container .react-calendar__tile:enabled:focus {
                                            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
                                            transform: scale(1.05);
                                        }
                                        .calendar-container .react-calendar__tile--now {
                                            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
                                            color: white;
                                            font-weight: bold;
                                        }
                                        .calendar-container .react-calendar__month-view__weekdays {
                                            text-align: center;
                                            text-transform: uppercase;
                                            font-weight: bold;
                                            font-size: 12px;
                                            color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
                                        }
                                        .calendar-container .react-calendar__navigation button {
                                            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
                                            color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
                                            font-size: 16px;
                                            font-weight: bold;
                                            border-radius: 12px;
                                            margin: 4px;
                                            transition: all 0.2s ease;
                                        }
                                        .calendar-container .react-calendar__navigation button:enabled:hover {
                                            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
                                            transform: scale(1.1);
                                        }
                                    `}</style>
                                    <Calendar />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

AdminDashboard.propTypes = {
    // Add any specific props if needed
};

export default AdminDashboard;