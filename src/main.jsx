import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.jsx";
import React from "react";
import "./index.css";

createRoot(document.getElementById("root")).render(

    <>
        <App />
        <ToastContainer />
    </>
);
