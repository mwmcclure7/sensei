import Header from "./pages/Header";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import RequestPasswordReset from "./pages/RequestPasswordReset";
import ResetPassword from "./pages/ResetPassword";
import InvalidLink from "./pages/InvalidLink";
import "./App.css";
import EmailUpdated from "./pages/EmailUpdated";
import Chat from "./pages/Chat";
import Contact from "./pages/Contact";
import Activate from "./pages/Activate";
import Activated from "./pages/Activated";
import UpdateEmail from "./pages/UpdateEmail";

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
                <div className="main-container">
                    <Routes >
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/logout" element={<Logout />} />
                        <Route path="/register" element={<RegisterAndLogout />} />
                        <Route path="/activated" element={<Activated />} />
                        <Route path="/activate/:uid/:token" element={<Activate />} />
                        <Route
                            path="/invalid-link"
                            element={<InvalidLink />}
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
                            path="/request-password-reset"
                            element={<RequestPasswordReset />}
                        />
                        <Route path="/reset-email/:uid/:token/:email" element={<UpdateEmail />} />
                        <Route path="/email-updated" element={<EmailUpdated />} />
                        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            <Toaster />
        </BrowserRouter>
    );
}

export default App;
