import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const OtpPage = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // userId passed via state after registration or login error
    const userId = location.state?.userId;

    const handleChange = (e, idx) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[idx] = value;
        setOtp(newOtp);

        // Move to next input if filled
        if (value && idx < 5) {
            document.getElementById(`otp-input-${idx + 1}`).focus();
        }
        // Move to previous input if deleted
        if (!value && idx > 0) {
            document.getElementById(`otp-input-${idx - 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.some((d) => d === "")) {
            toast.error("Please enter all 6 digits.");
            return;
        }
        setLoading(true);
        try {
            // Fetch fresh CSRF token before POST
            const csrfRes = await axios.get(`${API_URL}/csrf-token`, { withCredentials: true });
            const csrfToken = csrfRes.data.csrfToken;

            const code = otp.join("");
            await axios.post(
                `${API_URL}/auth/verify-otp`,
                { userId, otp: code },
                {
                    withCredentials: true,
                    headers: { "X-CSRF-Token": csrfToken }
                }
            );
            toast.success("Email verified!");
            // Optionally: auto-login after verification, or redirect to login
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
            <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700 max-w-lg w-full p-12 text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                    Email Verification
                </h2>
                <p className="text-gray-300 mb-8">Enter the 6-digit code sent to your email to verify your Anna account.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-3 mb-6">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                type="text"
                                id={`otp-input-${idx}`}
                                maxLength={1}
                                value={digit}
                                autoFocus={idx === 0}
                                onChange={(e) => handleChange(e, idx)}
                                className="w-12 h-16 text-2xl text-center bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-white"
                            />
                        ))}
                    </div>
                    <button
                        type="submit"
                        className="py-4 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg w-full"
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OtpPage;