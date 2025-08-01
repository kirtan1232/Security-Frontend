import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/footer.jsx";
import Sidebar from "../../components/sidebar.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUserProfile = async () => {
      setLoadingProfile(true);
      setProfileError("");
      try {
        const response = await axios.get(
          "https://localhost:3000/api/auth/profile",
          {
            withCredentials: true,
          }
        );

        if (!isMounted) return;

        setUserProfile(response.data);
        if (response.data.profilePicture) {
          setImagePreview(
            `https://localhost:3000/${response.data.profilePicture}`
          );
        }
      } catch (error) {
        if (!isMounted) return;
        if (error.response?.status === 401 || error.response?.status === 403) {
          setProfileError("Not authenticated. Please login.");
        } else {
          setProfileError("Failed to fetch profile");
        }
        setUserProfile(null);
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    fetchUserProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleProfilePictureClick = () => {
    if (userProfile) {
      navigate("/profile");
    }
  };

  const handleNavigation = (path) => {
    if (!userProfile) {
      setProfileError("Not authenticated. Please login.");
    } else {
      navigate(path);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="mb-4 text-2xl font-bold">Error</div>
        <div className="mb-4">{profileError}</div>
        <button
          className="px-4 py-2 bg-purple-600 rounded text-white"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-800 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="flex flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 p-6 flex justify-center items-start mt-6">
          <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8 w-full max-w-7xl h-[85vh] overflow-y-auto">
            {/* Profile Overview Header */}
            <header className="mb-8 flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div
                    onClick={handleProfilePictureClick}
                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center cursor-pointer border-4 border-gray-600 overflow-hidden"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Hello, {userProfile?.name || "User"}!
                  </h1>
                  <p className="text-gray-300 mt-1 text-lg">
                    {userProfile?.about || "Ready to learn something new?"}
                  </p>
                  {/* Email removed here */}
                </div>
              </div>
            </header>

            {/* Main Feature Card */}
            <div className="relative mt-8 h-64 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 text-white shadow-2xl cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="overflow-hidden rounded-2xl">
                <img
                  src="src/assets/images/untitled_design.png"
                  alt="Guitar and amplifier"
                  className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center items-start p-10 bg-gradient-to-r from-black/70 via-black/50 to-transparent">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold leading-tight">
                    Have not tried the lessons yet?
                  </h2>
                  <p className="text-xl text-gray-200 leading-relaxed">
                    Dive into the world of music
                  </p>
                  <button
                    className="group/btn relative overflow-hidden py-3 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-4"
                    onClick={() => handleNavigation("/lesson")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center space-x-2">
                      <span>Get Started</span>
                      <svg
                        className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                className="group relative h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-700 to-cyan-800 text-white shadow-2xl cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500"
                onClick={() => handleNavigation("/chords")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="src/assets/images/guitar2.jpg"
                    alt="Play along song"
                    className="absolute top-0 left-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h2 className="text-2xl font-bold mb-2 leading-tight">
                      Play along song with chords
                    </h2>
                    <p className="text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      Practice with your favorite songs and improve your chord
                      transitions
                    </p>
                  </div>
                  <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                className="group relative h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-700 to-teal-800 text-white shadow-2xl cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500"
                onClick={() => handleNavigation("/tuner")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="src/assets/images/tuner.PNG"
                    alt="Tune your instrument"
                    className="absolute top-0 left-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h2 className="text-2xl font-bold mb-2 leading-tight">
                      Tune your instruments easily
                    </h2>
                    <p className="text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      Keep your guitar perfectly tuned with our precision tuner
                    </p>
                  </div>
                  <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {/* Quick Stats or Additional Features */}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
