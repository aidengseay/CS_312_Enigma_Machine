// This component renders a simple homepage for the Enigma Machine app.
import React from "react";

export default function HomePage({ onLogin, onSignup }) {
    // Render a welcome message and only Login/Signup options
    return (
        <div className="page-center">
            <div className="main-panel">
                <h1 className="main-title">
                    Welcome to the Enigma Machine Emulator!
                </h1>
                <p className="main-desc">
                    Please log in or sign up to use the Enigma machine.
                </p>
                <div className="main-btn-row">
                    <button onClick={onLogin} className="main-btn main-btn-login">Log In</button>
                    <button onClick={onSignup} className="main-btn main-btn-signup">Sign Up</button>
                </div>
            </div>
        </div>
    );
}
