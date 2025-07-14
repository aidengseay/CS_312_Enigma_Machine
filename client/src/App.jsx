// imports /////////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from 'react';
import EnigmaMachine from './components/EnigmaMachine';
import LogInPage from './pages/LogInPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';

// main app function ///////////////////////////////////////////////////////////

function App() {
    // State for user authentication and page navigation
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // Store full user object
    const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'signup', 'enigma'
    
    // On mount, restore login state and last page from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem('enigmaUser');
        const savedPage = localStorage.getItem('enigmaPage');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsLoggedIn(true);
            setCurrentPage(savedPage || 'enigma');
        } else if (savedPage) {
            setCurrentPage(savedPage);
        }
    }, []);

    // Save current page to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('enigmaPage', currentPage);
    }, [currentPage]);

    // test config file
    const config = {
        rotors: [
            { spec: 'III', ringSetting: 0, startPosition: 0 },
            { spec: 'II', ringSetting: 0, startPosition: 0 },
            { spec: 'I', ringSetting: 0, startPosition: 0 },
        ],
        reflector: 'UKW_B',
        plugboardPairs: [
            ['A', 'B'],
            ['C', 'D'],
        ],
    };
    const config_id = 1; // For now, use 1. Update if you want dynamic configs.

    // Handle successful login
    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        setCurrentPage('enigma');
        localStorage.setItem('enigmaUser', JSON.stringify(userData));
        localStorage.setItem('enigmaPage', 'enigma');
    };

    // Handle successful signup
    const handleSignupSuccess = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        setCurrentPage('enigma');
        localStorage.setItem('enigmaUser', JSON.stringify(userData));
        localStorage.setItem('enigmaPage', 'enigma');
    };

    // Handle logout
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setCurrentPage('home');
        localStorage.removeItem('enigmaUser');
        localStorage.setItem('enigmaPage', 'home');
    };

    // Render different pages based on current state
    const renderPage = () => {
        if (!isLoggedIn) {
            switch (currentPage) {
                case 'home':
                    return <HomePage />;
                case 'login':
                    return <LogInPage 
                        onLoginSuccess={handleLoginSuccess}
                        onSwitchToSignup={() => setCurrentPage('signup')}
                    />;
                case 'signup':
                    return <SignUpPage 
                        onSignupSuccess={handleSignupSuccess}
                        onSwitchToLogin={() => setCurrentPage('login')}
                    />;
                default:
                    return <HomePage />;
            }
        } else {
            return (
                <div>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '20px',
                        padding: '10px',
                        background: '#2c2c2c',
                        borderRadius: '8px'
                    }}>
                        <h2 style={{ margin: 0, color: '#f39c12' }}>
                            Welcome, {user?.username}!
                        </h2>
                        <div>
                            <button 
                                onClick={handleLogout}
                                style={{
                                    background: '#e74c3c',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                    <EnigmaMachine config={config} user_id={user?.user_id} config_id={config_id}/>
                </div>
            );
        }
    };

    // Navigation bar (dont love this)
    const renderNav = () => (
        <nav style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            background: '#222',
            padding: '10px 0',
            marginBottom: '20px',
        }}>
            <button onClick={() => setCurrentPage('home')} style={{ color: '#f39c12', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>Home</button>
            <button onClick={() => setCurrentPage('login')} style={{ color: '#3498db', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>Login</button>
            <button onClick={() => setCurrentPage('signup')} style={{ color: '#27ae60', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>Sign Up</button>
        </nav>
    );

    // Render the app
    return (
        <div>
            {!isLoggedIn && renderNav()}
            {renderPage()}
        </div>
    );
}

export default App;