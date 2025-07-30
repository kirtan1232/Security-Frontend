import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/adminSidebar.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserShield,
    faSearch,
    faClock,
    faInfoCircle,
    faFilter,
    faRefresh,
    faEye,
    faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { sanitizeText } from "../../components/sanitizer"; // <-- Add this line

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [actionFilter, setActionFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);

    // Fetching like in viewChords: axios withCredentials only
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://localhost:3000/api/audit-logs", {
                withCredentials: true
            });
            setLogs(response.data.logs || []);
            setFilteredLogs(response.data.logs || []);
        } catch (err) {
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        let filtered = logs;
        if (filter.trim()) {
            filtered = filtered.filter(
                log =>
                    sanitizeText(log.action).toLowerCase().includes(sanitizeText(filter).toLowerCase()) ||
                    (sanitizeText(log.user?.email)?.toLowerCase() || "").includes(sanitizeText(filter).toLowerCase()) ||
                    (sanitizeText(log.ip) || "").toLowerCase().includes(sanitizeText(filter).toLowerCase())
            );
        }
        if (actionFilter.trim()) {
            filtered = filtered.filter(log =>
                sanitizeText(log.action).toLowerCase().includes(sanitizeText(actionFilter).toLowerCase())
            );
        }
        if (dateFilter.trim()) {
            filtered = filtered.filter(log => {
                const logDate = new Date(log.timestamp).toDateString();
                const filterDate = new Date(dateFilter).toDateString();
                return logDate === filterDate;
            });
        }
        setFilteredLogs(filtered);
    }, [filter, actionFilter, dateFilter, logs]);

    const getActionBadgeColor = (action) => {
        switch (action.toLowerCase()) {
            case 'login':
            case 'login_success':
                return 'bg-green-900/30 text-green-300 border-green-700';
            case 'logout':
                return 'bg-red-900/30 text-red-300 border-red-700';
            case 'register':
                return 'bg-blue-900/30 text-blue-300 border-blue-700';
            case 'update_profile':
                return 'bg-purple-900/30 text-purple-300 border-purple-700';
            case 'lesson_completed':
                return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
            case 'session_completed':
                return 'bg-indigo-900/30 text-indigo-300 border-indigo-700';
            case 'login_failed':
            case 'login_blocked':
            case 'account_locked':
                return 'bg-red-900/30 text-red-300 border-red-700';
            case 'forgot_password':
            case 'reset_password':
                return 'bg-orange-900/30 text-orange-300 border-orange-700';
            default:
                return 'bg-gray-700/30 text-gray-300 border-gray-600';
        }
    };

    const formatUserAgent = (userAgent) => {
        if (!userAgent) return "—";
        const safeUserAgent = sanitizeText(userAgent);
        const match = safeUserAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/);
        return match ? match[0] : "Unknown Browser";
    };

    const clearFilters = () => {
        setFilter("");
        setActionFilter("");
        setDateFilter("");
    };

    const uniqueActions = [...new Set(logs.map(log => sanitizeText(log.action)))];

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex overflow-hidden">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-800 rounded-full opacity-20 animate-pulse delay-2000"></div>
            </div>

            <AdminSidebar />
            <main className="flex-1 p-6 flex justify-center items-center overflow-hidden relative z-10">
                <div className="w-full max-w-7xl h-full bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                    {/* Header - Fixed */}
                    <div className="bg-gradient-to-r from-cyan-700 to-blue-700 p-6 text-white">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <FontAwesomeIcon icon={faUserShield} className="text-2xl text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Audit Log</h1>
                                    <p className="text-cyan-200">Monitor and track all system activities</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchLogs}
                                    className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    disabled={loading}
                                >
                                    <FontAwesomeIcon icon={faRefresh} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                <span className="px-3 py-2 bg-white/20 rounded-xl text-sm font-medium text-white">
                                    {filteredLogs.length} records
                                </span>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search Filter */}
                            <div className="relative">
                                <input
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/70 focus:border-white/40 focus:ring-4 focus:ring-white/10 outline-none transition-all duration-300"
                                    value={filter}
                                    onChange={e => setFilter(sanitizeText(e.target.value))}
                                    placeholder="Search by user, action, IP..."
                                />
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                            </div>

                            {/* Action Filter */}
                            <div className="relative">
                                <select
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white focus:border-white/40 focus:ring-4 focus:ring-white/10 outline-none appearance-none transition-all duration-300"
                                    value={actionFilter}
                                    onChange={e => setActionFilter(sanitizeText(e.target.value))}
                                >
                                    <option value="" className="bg-gray-800 text-white">All Actions</option>
                                    {uniqueActions.map(action => (
                                        <option key={action} value={action} className="bg-gray-800 text-white">{action}</option>
                                    ))}
                                </select>
                                <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                            </div>

                            {/* Date Filter */}
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white focus:border-white/40 focus:ring-4 focus:ring-white/10 outline-none transition-all duration-300"
                                    value={dateFilter}
                                    onChange={e => setDateFilter(sanitizeText(e.target.value))}
                                />
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={clearFilters}
                                className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-inner">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-200 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-200 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-200 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-200 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-200 uppercase tracking-wider">
                                            Source
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-200 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-900 divide-y divide-gray-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-20">
                                                <div className="flex flex-col items-center gap-4">
                                                    <FontAwesomeIcon icon={faClock} className="animate-spin text-4xl text-cyan-400" />
                                                    <span className="text-cyan-400 text-lg font-medium">Loading audit logs...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-20">
                                                <div className="flex flex-col items-center gap-4">
                                                    <FontAwesomeIcon icon={faInfoCircle} className="text-4xl text-cyan-400" />
                                                    <span className="text-cyan-400 text-lg font-medium">No logs found.</span>
                                                    <span className="text-sm text-gray-500">Try adjusting your filters</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log, index) => (
                                            <React.Fragment key={log._id}>
                                                <tr className="hover:bg-gray-800/50 transition-colors duration-200">
                                                    <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : "—"}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "—"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-300">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                                {sanitizeText(log.user?.email?.charAt(0).toUpperCase()) || "?"}
                                                            </div>
                                                            <span className="truncate max-w-xs">
                                                                {sanitizeText(log.user?.email) || "Unknown User"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${getActionBadgeColor(sanitizeText(log.action))}`}>
                                                            {sanitizeText(log.action)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs">
                                                        <div className="truncate">
                                                            {Object.keys(log.details || {}).length > 0
                                                                ? `${Object.keys(log.details).length} properties`
                                                                : "No details"
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-400">
                                                        <div className="space-y-1">
                                                            <div className="font-mono text-xs bg-gray-800 px-2 py-1 rounded shadow-sm">
                                                                {sanitizeText(log.ip) || "—"}
                                                            </div>
                                                            <div className="truncate max-w-xs">
                                                                {formatUserAgent(log.userAgent)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <button
                                                            onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                                                            className="text-cyan-400 hover:text-cyan-200 transition-colors duration-200 px-2 py-1 rounded hover:bg-cyan-900/20"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                                                            {expandedRow === index ? 'Hide' : 'View'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedRow === index && (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-4 bg-gray-800/50">
                                                            <div className="space-y-3">
                                                                <h4 className="font-semibold text-gray-200 flex items-center">
                                                                    Detailed Information
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <h5 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                                                                            Details
                                                                        </h5>
                                                                        <pre className="bg-gray-900 p-3 rounded-lg text-xs overflow-auto max-h-40 border shadow-inner resize-none">
                                                                            {JSON.stringify(log.details, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                                                                            User Agent
                                                                        </h5>
                                                                        <p className="bg-gray-900 p-3 rounded-lg text-xs border break-all shadow-inner max-h-40 overflow-auto resize-none">
                                                                            {sanitizeText(log.userAgent) || "Not available"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuditLog;