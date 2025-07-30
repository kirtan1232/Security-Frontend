import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import eSewaIcon from "../assets/images/esewa.jpg";
import tickGif from "../assets/images/tick.gif"; // <-- Correct way to import gif
import { sanitizeText } from "../components/sanitizer";

const Success = () => {
  const navigate = useNavigate();

  // CSRF helper (with small delay)
  async function getFreshCsrfToken() {
    const res = await fetch("https://localhost:3000/api/csrf-token", { credentials: "include" });
    const { csrfToken } = await res.json();
    await new Promise((resolve) => setTimeout(resolve, 100));
    return csrfToken;
  }

  useEffect(() => {
    const saveSupportRecord = async () => {
      const donationData = JSON.parse(localStorage.getItem("pendingDonation"));
      if (!donationData) {
        console.log("No donation data found in localStorage");
        return;
      }
      const safeDonationData = {
        amount: donationData.amount,
        nameOrSocial: sanitizeText(donationData.nameOrSocial),
        message: sanitizeText(donationData.message),
      };

      try {
        const csrfToken = await getFreshCsrfToken();
        await fetch("https://localhost:3000/api/support", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "X-CSRF-Token": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify(safeDonationData),
        });
        localStorage.removeItem("pendingDonation");
      } catch (error) {
        console.error("Error saving support record:", error);
      }
    };

    saveSupportRecord();

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
            src={tickGif}
            alt="Success"
            className="w-96 h-64 object-cover rounded-lg shadow-md"
            onError={e => { e.target.src = "https://media.tenor.com/1cWv2t3r1r8AAAAC/check.gif"; }}
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