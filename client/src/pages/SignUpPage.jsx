// This component renders the signup form and handles user registration.
import React, { useState } from "react";
import axios from "axios";

export default function SignInPage({ onSignupSuccess, onSwitchToLogin }) {
    // State for form fields and UI feedback
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle form submission for signup
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        // Validate passwords
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            // Send registration request to backend
            const response = await axios.post("/register", {
                username,
                password
            });
            // If registration is successful, call parent handler
            if (response.data.user) {
                onSignupSuccess(response.data.user);
            }
        } catch (err) {
            // Show error message if registration fails
            setError(err.response?.data?.error || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    // Render the signup form UI
    return (
        <div className="page-center">
            <div className="main-panel">
                <h1 className="main-title">Create Account</h1>
                <form className="main-form" onSubmit={handleSubmit}>
                    <div className="main-form-group">
                        <label className="main-label">Username:</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="main-input" required />
                    </div>
                    <div className="main-form-group">
                        <label className="main-label">Password:</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="main-input" required />
                    </div>
                    <div className="main-form-group">
                        <label className="main-label">Confirm Password:</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="main-input" required />
                    </div>
                    {error && <div className="main-error">{error}</div>}
                    <button type="submit" disabled={loading} className="main-btn main-btn-signup">{loading ? "Creating account..." : "Sign Up"}</button>
                    <div className="main-link-row">
                        Already have an account?{' '}
                        <button type="button" onClick={onSwitchToLogin} className="main-link-btn">Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
