import React from "react";

export default function SavedMessages({ onBack }) {
    return (
        <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#222", borderRadius: 12, color: "#fff" }}>
            <button onClick={onBack} style={{ marginBottom: 16, background: "#3498db", color: "#fff", border: "none", borderRadius: 4, padding: "6px 14px", cursor: "pointer" }}>
                ← Back
            </button>
            <h2 style={{ color: "#f39c12" }}>Saved Messages</h2>
            <p>This is where your saved messages will appear.</p>
        </div>
    );
}
