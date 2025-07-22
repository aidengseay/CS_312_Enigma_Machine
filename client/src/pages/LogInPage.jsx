// This component renders the login form and handles user authentication.
import React, { useState } from "react";
import axios from "axios";

export default function LogInPage({ onLoginSuccess, onSwitchToSignup }) {
    // State for form fields and UI feedback
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle form submission for login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // Send login request to backend
            const response = await axios.post("/login", {
                username,
                password
            });
            // If login is successful, call parent handler
            if (response.data.user) {
                onLoginSuccess(response.data.user);
            }
        } catch (err) {
            // Show error message if login fails
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    // Render the login form UI
    return (
        <div className="page-center">
            <div className="main-panel">
                <h1 className="main-title">Enigma Machine Login</h1>
                <form className="main-form" onSubmit={handleSubmit}>
                    <div className="main-form-group">
                        <label className="main-label">Username:</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="main-input" required />
                    </div>
                    <div className="main-form-group">
                        <label className="main-label">Password:</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="main-input" required />
                    </div>
                    {error && <div className="main-error">{error}</div>}
                    <button type="submit" disabled={loading} className="main-btn main-btn-login">{loading ? "Logging in..." : "Login"}</button>
                    <div className="main-link-row">
                        Don't have an account?{' '}
                        <button type="button" onClick={onSwitchToSignup} className="main-link-btn">Sign up</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
