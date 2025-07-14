// This component renders a simple homepage for the Enigma Machine app.
import React from 'react';

export default function HomePage() {
    // Render a welcome message and navigation instructions
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            fontFamily: 'Courier New, monospace'
        }}>
            <div style={{
                background: 'linear-gradient(145deg, #8b4513, #a0522d)',
                border: '8px solid #654321',
                borderRadius: '15px',
                padding: '40px',
                boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
                minWidth: '400px',
                textAlign: 'center'
            }}>
                {/* Main heading */}
                <h1 style={{
                    color: '#f39c12',
                    marginBottom: '30px',
                    textShadow: '0 0 10px #f39c12'
                }}>
                    Welcome to the Enigma Machine Emulator!
                </h1>
                {/* Welcome and instructions */}
                <p style={{ color: '#ecf0f1', fontSize: '18px', marginBottom: '20px' }}>
                    Please log in or sign up to use the Enigma machine.
                </p>
                <p style={{ color: '#ecf0f1', fontSize: '16px' }}>
                    Use the navigation above to get started.
                </p>
            </div>
        </div>
    );
}
