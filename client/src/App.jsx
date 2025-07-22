// imports /////////////////////////////////////////////////////////////////////

import { useState, useEffect, useRef } from "react";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import AccountPage from "./pages/AccountPage";
import ConfigPage from "./pages/ConfigPage";
import EnigmaMachine from "./components/EnigmaMachine";
import axios from "axios";

// main app function ///////////////////////////////////////////////////////////

// Main App component for Enigma Machine Emulator
function App() {
    // State for user authentication and page navigation
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // Store full user object
    const [user, setUser] = useState(null);
    // Track the current page (e.g., 'home', 'login', 'signup', 'enigma', 'configurations')
    const [currentPage, setCurrentPage] = useState("home");
    // State for dropdown menu
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    // Track if user has at least one saved config (null = unknown/loading, false = no config, true = has config)
    const [hasConfig, setHasConfig] = useState(null);
    // Track if we are currently checking configs (for loading state)
    const [checkingConfig, setCheckingConfig] = useState(false);

    // On mount, restore login state and last page from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem("enigmaUser");
        const savedPage = localStorage.getItem("enigmaPage");
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsLoggedIn(true);
            // Always check configs on mount if logged in
            checkUserConfigs(userData.user_id);
            // Use the saved page if present, otherwise default to configurations
            setCurrentPage(savedPage || "configurations");
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

    // Fetch user's saved configs from backend and update hasConfig
    // Used after login/signup and on mount
    const checkUserConfigs = async (user_id) => {
        setCheckingConfig(true);
        setHasConfig(null);
        try {
            const response = await axios.get(`/configs?user_id=${user_id}`);
            const configs = response.data.configs || [];
            setHasConfig(configs.length > 0);
        } catch (err) {
            setHasConfig(false);
        } finally {
            setCheckingConfig(false);
        }
    };

    // Handle successful login: force ConfigPage and check configs
    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        setCurrentPage("configurations");
        localStorage.setItem("enigmaUser", JSON.stringify(userData));
        localStorage.setItem("enigmaPage", "configurations");
        checkUserConfigs(userData.user_id);
    };

    // Handle successful signup: force ConfigPage and check configs
    const handleSignupSuccess = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        setCurrentPage("configurations");
        localStorage.setItem("enigmaUser", JSON.stringify(userData));
        localStorage.setItem("enigmaPage", "configurations");
        checkUserConfigs(userData.user_id);
    };

    // Called by ConfigPage when a config is saved, so user can now navigate
    const handleConfigSaved = () => {
        setHasConfig(true);
    };

    // Handle logout: reset config state
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setCurrentPage("home");
        setHasConfig(null);
        localStorage.removeItem("enigmaUser");
        localStorage.setItem("enigmaPage", "home");
    };

    // Guard navigation: only allow if user has a config, otherwise force ConfigPage
    const guardedSetCurrentPage = (page) => {
        if (!hasConfig && isLoggedIn) {
            setCurrentPage("configurations");
        } else {
            setCurrentPage(page);
        }
    };

    // Handler to force navigation to ConfigPage
    const handleForceConfigPage = () => {
        setCurrentPage("configurations");
    };

    // Render different pages based on current state
    const renderPage = () => {
        if (!isLoggedIn) {
            // Not logged in: normal navigation
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
            // ENFORCE CONFIG PAGE UNTIL CONFIG SAVED
            // Show loading while checking configs
            if (checkingConfig || hasConfig === null) {
                return <div style={{textAlign: "center", marginTop: 80, color: "#f39c12", fontSize: 24}}>Checking your saved configurations...</div>;
            }
            // If user does not have a config, force ConfigPage and block all other navigation
            if (!hasConfig) {
                // Always force config page if no configs, and update localStorage
                localStorage.setItem("enigmaPage", "configurations");
                return <ConfigPage user_id={user?.user_id} onConfigSaved={handleConfigSaved} onForceConfigPage={handleForceConfigPage} />;
            }
            // User has config, allow normal navigation
            switch (currentPage) {
                case "account":
                    return <AccountPage user={user} onLogout={handleLogout} onBack={() => guardedSetCurrentPage("enigma")} />;
                case "configurations":
                    return <ConfigPage user_id={user?.user_id} onConfigSaved={handleConfigSaved} onForceConfigPage={handleForceConfigPage} />;
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
                    return <EnigmaMachine config={defaultConfig} user_id={user?.user_id} config_id={1} onBackToConfig={handleForceConfigPage}/>;
                default:
                    return <ConfigPage user_id={user?.user_id} onConfigSaved={handleConfigSaved} onForceConfigPage={handleForceConfigPage} />;
            }
        }
    };

    // Dropdown menu for logged-in users, shown on all pages except home.
    // The options are hardcoded in alphabetical order, with Logout always last.
    // Dropdown is disabled until user has a config
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
                    cursor: hasConfig ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                aria-label="Open user menu"
                disabled={!hasConfig} // Disable dropdown if no config
            >
                ☰
            </button>
            {/* Only show dropdown options if user has a config */}
            {isDropdownOpen && hasConfig && (
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
                        onClick={() => { guardedSetCurrentPage("account"); setIsDropdownOpen(false); }}
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
                        disabled={!hasConfig}
                    >
                        Account
                    </button>
                    <button
                        onClick={() => { guardedSetCurrentPage("enigma"); setIsDropdownOpen(false); }}
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
                        disabled={!hasConfig}
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