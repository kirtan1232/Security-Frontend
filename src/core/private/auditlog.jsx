import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/adminSidebar.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUserShield, 
    faSearch, 
    faClock, 
    faInfoCircle, 
    faFilter,
    faDownload,
    faRefresh,
    faEye,
    faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../../components/ThemeContext";

const AuditLog = () => {
    const { theme } = useTheme();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [actionFilter, setActionFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://localhost:3000/api/audit-logs", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setLogs(data.logs || []);
            setFilteredLogs(data.logs || []);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = logs;
        
        // Text filter
        if (filter.trim()) {
            filtered = filtered.filter(
                log =>
                    log.action.toLowerCase().includes(filter.toLowerCase()) ||
                    (log.user?.email?.toLowerCase() || "").includes(filter.toLowerCase()) ||
                    (log.ip || "").toLowerCase().includes(filter.toLowerCase())
            );
        }
        
        // Action filter
        if (actionFilter.trim()) {
            filtered = filtered.filter(log => 
                log.action.toLowerCase().includes(actionFilter.toLowerCase())
            );
        }
        
        // Date filter
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
            case 'login': return 'bg-green-100 text-green-800 border-green-200';
            case 'logout': return 'bg-red-100 text-red-800 border-red-200';
            case 'register': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'update_profile': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'lesson_completed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'session_completed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'login_failed': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatUserAgent = (userAgent) => {
        if (!userAgent) return "—";
        // Extract browser info
        const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/);
        return match ? match[0] : "Unknown Browser";
    };

    const clearFilters = () => {
        setFilter("");
        setActionFilter("");
        setDateFilter("");
    };

    const uniqueActions = [...new Set(logs.map(log => log.action))];

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 flex flex-col md:flex-row`}>
            <AdminSidebar />
            <main className="flex-1 p-4 md:p-8 overflow-hidden">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 h-full flex flex-col">
                    
                    {/* Header */}
                    <header className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                                    <FontAwesomeIcon icon={faUserShield} className="text-xl text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                                        Audit Log
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Monitor and track all system activities
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetchLogs}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    disabled={loading}
                                >
                                    <FontAwesomeIcon icon={faRefresh} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {filteredLogs.length} records
                                </span>
                            </div>
                        </div>
                        
                        {/* Advanced Filters */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search Filter */}
                            <div className="relative">
                                <input
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-400 outline-none transition-all duration-300"
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                    placeholder="Search by user, action, IP..."
                                />
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                            </div>
                            
                            {/* Action Filter */}
                            <div className="relative">
                                <select
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-400 outline-none appearance-none transition-all duration-300"
                                    value={actionFilter}
                                    onChange={e => setActionFilter(e.target.value)}
                                >
                                    <option value="">All Actions</option>
                                    {uniqueActions.map(action => (
                                        <option key={action} value={action}>{action}</option>
                                    ))}
                                </select>
                                <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                            </div>
                            
                            {/* Date Filter */}
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-400 outline-none transition-all duration-300"
                                    value={dateFilter}
                                    onChange={e => setDateFilter(e.target.value)}
                                />
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                            </div>
                            
                            {/* Clear Filters */}
                            <button
                                onClick={clearFilters}
                                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </header>

                    {/* Table Container with Custom Scrollbar */}
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <div className="min-w-full">
                            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-700 dark:text-cyan-200 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-700 dark:text-cyan-200 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-700 dark:text-cyan-200 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-700 dark:text-cyan-200 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-700 dark:text-cyan-200 uppercase tracking-wider">
                                            Source
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-700 dark:text-cyan-200 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
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
                                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : "—"}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "—"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                {log.user?.email?.charAt(0).toUpperCase() || "?"}
                                                            </div>
                                                            <span className="truncate max-w-xs">
                                                                {log.user?.email || "Unknown User"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionBadgeColor(log.action)}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                                                        <div className="truncate">
                                                            {Object.keys(log.details || {}).length > 0 
                                                                ? `${Object.keys(log.details).length} properties`
                                                                : "No details"
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                                        <div className="space-y-1">
                                                            <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                                {log.ip || "—"}
                                                            </div>
                                                            <div className="truncate max-w-xs">
                                                                {formatUserAgent(log.userAgent)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <button
                                                            onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                                                            className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-200 transition-colors duration-200"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                                                            {expandedRow === index ? 'Hide' : 'View'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedRow === index && (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                                                            <div className="space-y-3">
                                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Detailed Information</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Details</h5>
                                                                        <pre className="bg-white dark:bg-gray-900 p-3 rounded-lg text-xs overflow-auto max-h-40 custom-scrollbar border">
                                                                            {JSON.stringify(log.details, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">User Agent</h5>
                                                                        <p className="bg-white dark:bg-gray-900 p-3 rounded-lg text-xs border break-all">
                                                                            {log.userAgent || "Not available"}
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

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(45deg, rgba(6, 182, 212, 0.5), rgba(59, 130, 246, 0.5));
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(45deg, rgba(6, 182, 212, 0.8), rgba(59, 130, 246, 0.8));
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-corner {
                    background: transparent;
                }
            `}</style>
        </div>
    );
};

export default AuditLog;