import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import eSewaIcon from "../assets/images/esewa.jpg";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const saveSupportRecord = async () => {
      // Retrieve donation data from localStorage
      const donationData = JSON.parse(localStorage.getItem("pendingDonation"));

      if (!donationData) {
        console.log("No donation data found in localStorage");
        return;
      }

      console.log("Attempting to save support record:", donationData);
      try {
        const response = await fetch("https://localhost:3000/api/support", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(donationData),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to save support record");
        }

        console.log("Support record saved successfully:", result);
        // Clear donation data from localStorage after saving
        localStorage.removeItem("pendingDonation");
      } catch (error) {
        console.error("Error saving support record:", error);
      }
    };

    saveSupportRecord();

    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-center mb-8">
        <img src={eSewaIcon} alt="eSewa Icon" className="w-10 h-10 mr-2" />
        <div className="text-white text-3xl font-bold">eSewa</div>
      </div>

      <div className="text-center bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-green-400">Payment Success!</h2>
        <p className="text-gray-300 mt-2">
          <img
            src="../src/assets/images/tick.gif"
            alt="Success"
            className="w-96 h-64 object-cover rounded-lg shadow-md"
          />
        </p>
        <p className="text-orange-400 mt-4 text-lg font-bold">
          Redirecting back to HomeScreen...
        </p>
      </div>
    </div>
  );
};

export default Success;