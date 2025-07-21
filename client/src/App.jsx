// imports /////////////////////////////////////////////////////////////////////

import { useState, useEffect, useRef } from "react";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import AccountPage from "./pages/AccountPage";
import ConfigPage from "./pages/ConfigPage";
import EnigmaMachine from "./components/EnigmaMachine";

// main app function ///////////////////////////////////////////////////////////

function App() {

    // State for user authentication and page navigation
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // Store full user object
    const [user, setUser] = useState(null);
    // pages: "home", "login", "signup", "enigma"
    const [currentPage, setCurrentPage] = useState("home");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // On mount, restore login state and last page from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem("enigmaUser");
        const savedPage = localStorage.getItem("enigmaPage");
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsLoggedIn(true);
            setCurrentPage(savedPage || "enigma");
        } else if (savedPage) {
            setCurrentPage(savedPage);
        }
    }, []);

    // Save current page to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("enigmaPage", currentPage);
    }, [currentPage]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Handle successful login
    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        setCurrentPage("enigma");
        localStorage.setItem("enigmaUser", JSON.stringify(userData));
        localStorage.setItem("enigmaPage", "enigma");
    };

    // Handle successful signup
    const handleSignupSuccess = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        setCurrentPage("enigma");
        localStorage.setItem("enigmaUser", JSON.stringify(userData));
        localStorage.setItem("enigmaPage", "enigma");
    };

    // Handle logout
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setCurrentPage("home");
        localStorage.removeItem("enigmaUser");
        localStorage.setItem("enigmaPage", "home");
    };

    // Render different pages based on current state
    const renderPage = () => {
        if (!isLoggedIn) {
            switch (currentPage) {
                case "home":
                    return <HomePage onLogin={() => setCurrentPage("login")} onSignup={() => setCurrentPage("signup")} />;
                case "login":
                    return <LogInPage 
                        onLoginSuccess={handleLoginSuccess}
                        onSwitchToSignup={() => setCurrentPage("signup")}
                    />;
                case "signup":
                    return <SignUpPage 
                        onSignupSuccess={handleSignupSuccess}
                        onSwitchToLogin={() => setCurrentPage("login")}
                    />;
                default:
                    return <HomePage onLogin={() => setCurrentPage("login")} onSignup={() => setCurrentPage("signup")} />;
            }
        } else {
            // If logged in and currentPage is home, redirect to enigma
            if (currentPage === "home") {
                setCurrentPage("enigma");
                return null;
            }
            switch (currentPage) {
                case "account":
                    return <AccountPage user={user} onLogout={handleLogout} onBack={() => setCurrentPage("enigma")} />;
                case "configurations":
                    return <ConfigPage user_id={user?.user_id} />;
                case "enigma":
                    // Default config for EnigmaMachine if needed
                    const defaultConfig = {
                        rotors: [
                            { spec: "III", ringSetting: 0, startPosition: 0 },
                            { spec: "II", ringSetting: 0, startPosition: 0 },
                            { spec: "I", ringSetting: 0, startPosition: 0 },
                        ],
                        reflector: "UKW_B",
                        plugboardPairs: [
                            ["A", "B"],
                            ["C", "D"],
                        ],
                    };
                    return <EnigmaMachine config={defaultConfig} user_id={user?.user_id} config_id={1}/>;
                default:
                    return <ConfigPage user_id={user?.user_id} />;
            }
        }
    };



    // Dropdown menu for logged-in users, shown on all pages except home.
    // The options are hardcoded in alphabetical order, with Logout always last.
    const renderDropdown = () => (
        <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen((open) => !open)}
                style={{
                    background: "#444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    fontSize: 22,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                aria-label="Open user menu"
            >
                ☰
            </button>
            {isDropdownOpen && (
                <div style={{
                    position: "absolute",
                    top: 48,
                    right: 0,
                    background: "#222",
                    border: "1px solid #444",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    minWidth: 200,
                    zIndex: 1000,
                    padding: 0
                }}>
                    {/* Dropdown options in alphabetical order, except Logout last */}
                    <button
                        onClick={() => { setCurrentPage("account"); setIsDropdownOpen(false); }}
                        style={{
                            width: "100%",
                            background: "none",
                            color: "#3498db",
                            border: "none",
                            padding: "12px 20px",
                            textAlign: "right",
                            cursor: "pointer",
                            fontSize: 16
                        }}
                    >
                        Account
                    </button>
                    <button
                        onClick={() => { setCurrentPage("configurations"); setIsDropdownOpen(false); }}
                        style={{
                            width: "100%",
                            background: "none",
                            color: "#27ae60",
                            border: "none",
                            padding: "12px 20px",
                            textAlign: "right",
                            cursor: "pointer",
                            fontSize: 16
                        }}
                    >
                        Configrations
                    </button>
                    <button
                        onClick={() => { setCurrentPage("enigma"); setIsDropdownOpen(false); }}
                        style={{
                            width: "100%",
                            background: "none",
                            color: "#f39c12",
                            border: "none",
                            padding: "12px 20px",
                            textAlign: "right",
                            cursor: "pointer",
                            fontSize: 16
                        }}
                    >
                        Enigma Machine
                    </button>
                    {/* Logout is always last */}
                    <button
                        onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                        style={{
                            width: "100%",
                            background: "none",
                            color: "#e74c3c",
                            border: "none",
                            padding: "12px 20px",
                            textAlign: "right",
                            cursor: "pointer",
                            fontSize: 16
                        }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );

    // Only show the dropdown and top bar when logged in and not on the home page.
    // This keeps the homepage clean for new/returning users.
    return (
        <div>
            {isLoggedIn && currentPage !== "home" && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "10px", background: "#2c2c2c", borderRadius: "8px", position: "relative" }}>
                    <h2 style={{ margin: 0, color: "#f39c12" }}>
                        Welcome, {user?.username}!
                    </h2>
                    {renderDropdown()}
                </div>
            )}
            {renderPage()}
        </div>
    );
}

export default App;