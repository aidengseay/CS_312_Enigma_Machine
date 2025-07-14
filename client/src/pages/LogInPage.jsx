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
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
            fontFamily: "Courier New, monospace"
        }}>
            <div style={{
                background: "linear-gradient(145deg, #8b4513, #a0522d)",
                border: "8px solid #654321",
                borderRadius: "15px",
                padding: "40px",
                boxShadow: "0 0 30px rgba(0, 0, 0, 0.8)",
                minWidth: "400px"
            }}>
                <h1 style={{
                    color: "#f39c12",
                    textAlign: "center",
                    marginBottom: "30px",
                    textShadow: "0 0 10px #f39c12"
                }}>
                    Enigma Machine Login
                </h1>
                {/* Login form */}
                <form onSubmit={handleSubmit}>
                    {/* Username input */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            color: "#ecf0f1",
                            marginBottom: "8px",
                            fontSize: "16px"
                        }}>
                            Username:
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px solid #555",
                                borderRadius: "5px",
                                background: "#1a1a1a",
                                color: "#ecf0f1",
                                fontSize: "16px",
                                boxSizing: "border-box"
                            }}
                            required
                        />
                    </div>
                    {/* Password input */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            color: "#ecf0f1",
                            marginBottom: "8px",
                            fontSize: "16px"
                        }}>
                            Password:
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px solid #555",
                                borderRadius: "5px",
                                background: "#1a1a1a",
                                color: "#ecf0f1",
                                fontSize: "16px",
                                boxSizing: "border-box"
                            }}
                            required
                        />
                    </div>
                    {/* Error message */}
                    {error && (
                        <div style={{
                            color: "#e74c3c",
                            marginBottom: "20px",
                            textAlign: "center",
                            padding: "10px",
                            background: "#2c2c2c",
                            borderRadius: "5px"
                        }}>
                            {error}
                        </div>
                    )}
                    {/* Login button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: "#3498db",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "16px",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            marginBottom: "15px"
                        }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                    {/* Link to signup page */}
                    <div style={{
                        textAlign: "center",
                        color: "#ecf0f1"
                    }}>
                        Don"t have an account?{" "}
                        <button
                            type="button"
                            onClick={onSwitchToSignup}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#3498db",
                                cursor: "pointer",
                                textDecoration: "underline",
                                fontSize: "14px"
                            }}
                        >
                            Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
