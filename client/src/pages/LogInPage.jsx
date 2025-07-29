// This component renders the login form and handles user authentication.
import React, { useState } from "react";
import axios from "axios";

export default function LogInPage({ onLoginSuccess, onSwitchToSignup }) {
    // State for form fields and UI feedback
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Validate form inputs
    const validateForm = () => {
        const errors = [];
        
        if (!username.trim()) {
            errors.push("Username is required");
        } else if (username.trim().length > 50) {
            errors.push("Username must be 50 characters or less");
        } else if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
            errors.push("Username can only contain letters, numbers, underscores, and hyphens");
        }
        
        if (!password) {
            errors.push("Password is required");
        } else if (password.length < 6) {
            errors.push("Password must be at least 6 characters long");
        }
        
        return errors;
    };

    // Handle form submission for login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        // Validate form inputs
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }
        
        setLoading(true);
        try {
            // Send login request to backend
            const response = await axios.post("/login", {
                username: username.trim(),
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
