import React from "react";
import Header from "./pages/Header";
import Home from "./pages/Home";
import Footer from "./pages/Footer";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import InvalidActivation from "./pages/InvalidActivation";
import ActivateEmailSent from "./pages/ActivateEmailSent";
import RequestPasswordReset from "./pages/RequestPasswordReset";
import ResetPassword from "./pages/ResetPassword";
import "./App.css";

function Logout() {
    localStorage.clear();
    window.dispatchEvent(new CustomEvent("logout"));
    return <Navigate to="/" />;
}

function RegisterAndLogout() {
    localStorage.clear();
    window.dispatchEvent(new CustomEvent("logout"));
    return <Register />;
}

function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/register" element={<RegisterAndLogout />} />
                <Route
                    path="/invalid-activation"
                    element={<InvalidActivation />}
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/activate-email-sent"
                    element={<ActivateEmailSent />}
                />
                <Route
                    path="/request-password-reset"
                    element={<RequestPasswordReset />}
                />
                <Route path="/reset-password/:uid/:token*" element={<ResetPassword />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}

export default App;
