import React, { useEffect, useState } from "react";
import { FaCoffee, FaHeart, FaMusic, FaGuitar } from "react-icons/fa"; // For the coffee cup icon
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../../components/footer.jsx";
import Sidebar from "../../components/sidebar.jsx";

const SupportPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);
  const [nameOrSocial, setNameOrSocial] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState(10); // Changed default amount to 10

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("https://localhost:3000/api/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Check for payment status on component mount and location change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get("payment");

    if (paymentStatus === "failure") {
      toast.error("Payment failed. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Clear donation data from localStorage on failure
      localStorage.removeItem("pendingDonation");
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate]);

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    if (!nameOrSocial.trim()) {
      toast.error("Please enter your name or social handle.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Store donation details in localStorage before initiating payment
    const donationData = {
      amount,
      nameOrSocial,
      message,
    };
    console.log("Storing donation data in localStorage:", donationData);
    localStorage.setItem("pendingDonation", JSON.stringify(donationData));

    try {
      const response = await fetch(`https://localhost:3000/api/esewa/donate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          nameOrSocial,
          message,
          success_url: `https://localhost:3000/api/esewa/success?redirect=/success`,
          failure_url: `https://localhost:3000/api/esewa/failure?redirect=/payment?payment=failure`,
        }),
      });
      const data = await response.json();
      if (data.message === "Donation Order Created Successfully") {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        Object.keys(data.formData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data.formData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error("Failed to initiate payment.", {
          position: "top-right",
          autoClose: 3000,
        });
        localStorage.removeItem("pendingDonation");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
      localStorage.removeItem("pendingDonation");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-800 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative flex flex-1 z-10">
        <Sidebar />
        <main className="flex-1 p-6 flex justify-center items-center mt-6">
          <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-6xl border border-gray-700/50">
            {/* Header with enhanced styling */}
            <header className="mb-8 flex items-center space-x-4 animate-fade-in">
              {userProfile && userProfile.profilePicture ? (
                <img
                  src={`https://localhost:3000/${userProfile.profilePicture}`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-gradient-to-r from-purple-400 to-blue-400 border-gray-600 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/profile")}
                />
              ) : (
                <img
                  src="src/assets/images/profile.png"
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-gradient-to-r from-purple-400 to-blue-400 border-gray-600 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/profile")}
                />
              )}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Hello, {userProfile ? userProfile.name : "User"}
                </h1>
                <p className="text-gray-300 mt-1">Support Soundwise's musical journey</p>
              </div>
            </header>

            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-5xl bg-gray-700/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600/30 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Left Section - About with enhanced styling */}
                  <div className="lg:w-1/2 p-8 bg-gradient-to-br from-gray-700 to-gray-800/30">
                    <div className="flex items-center mb-6">
                      <FaMusic className="text-purple-400 text-2xl mr-3" />
                      <h2 className="text-2xl font-bold text-gray-200">
                        About Soundwise
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-gray-300">
                      <div className="flex items-start space-x-3">
                        <FaGuitar className="text-purple-400 mt-1 flex-shrink-0" />
                        <p>
                          I'm dedicated to making music more accessible for musicians
                          by uncovering the perfect chord progressions for your
                          favorite songs. Whether it's finding the chords to a classic
                          hit or a new release, I work hard to bring you the most
                          accurate and easy-to-follow chords paired with lyrics.
                        </p>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <FaHeart className="text-red-400 mt-1 flex-shrink-0" />
                        <p>
                          I also offer a special song request feature, where you can
                          ask for your favorite song's chords, and I'll do my best to
                          post it for you. Your support on Soundwise helps me keep this
                          project going, ensuring I can continue creating valuable
                          content and fulfilling song requests.
                        </p>
                      </div>
                      
                      <div className="bg-gray-600/50 rounded-lg p-4 border-l-4 border-purple-500">
                        <p className="italic">
                          "Thank you for being part of this musical journey! Together,
                          we'll make every song a little easier to play, one chord at
                          a time."
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex space-x-4">
                      <a
                        href="https://www.facebook.com/buymeacoffee"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <span>Facebook</span>
                      </a>
                      <a
                        href="https://www.instagram.com/buymeacoffee"
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <span>Instagram</span>
                      </a>
                    </div>
                  </div>

                  {/* Right Section - Payment Form with enhanced styling */}
                  <div className="lg:w-1/2 p-8 bg-gradient-to-br from-gray-600/30 to-purple-900/30">
                    <div className="flex items-center justify-center mb-6">
                      <FaCoffee className="text-4xl text-amber-400 mr-3 animate-pulse" />
                      <h2 className="text-2xl font-bold text-gray-200">
                        Buy Soundwise a Coffee
                      </h2>
                    </div>
                    
                    {/* Amount Selection with enhanced styling */}
                    <div className="mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <FaCoffee className="text-2xl text-amber-400 mr-2" />
                        <span className="text-gray-300 text-lg">×</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[10, 20, 30, 50].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setAmount(value)}
                            className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                              amount === value
                                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                                : "bg-gray-600/70 text-gray-200 hover:bg-gray-600 shadow-md"
                            }`}
                          >
                            Rs. {value}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <form onSubmit={handleDonationSubmit} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={nameOrSocial}
                          onChange={(e) => setNameOrSocial(e.target.value)}
                          placeholder="Name or @yoursocial"
                          className="w-full p-4 border border-gray-600 rounded-xl bg-gray-600/80 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                          required
                        />
                      </div>
                      <div>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Say something nice... 💝"
                          rows="3"
                          className="w-full p-4 border border-gray-600 rounded-xl bg-gray-600/80 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                      >
                        <FaCoffee className="text-lg" />
                        <span>Support Rs. {amount}</span>
                        <FaHeart className="text-lg text-red-300" />
                      </button>
                    </form>
                    
                    <div className="mt-4 text-center text-sm text-gray-400">
                      <p>🔒 Secure payment via eSewa</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
      
      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SupportPayment;