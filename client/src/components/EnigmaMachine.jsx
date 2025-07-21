// imports /////////////////////////////////////////////////////////////////////

// React hooks and Enigma logic imports
import { useState, useRef, useEffect } from "react";
import EnigmaKeyboard from "./Keyboard";
import { Rotator } from "../utilities/RotorLogic";
import { Plugboard } from "../utilities/PlugboardLogic";
import { Reflector } from "../utilities/ReflectorLogic";
import { encodeLetter } from "../utilities/EncodeLogic";
import { ROTORS, REFLECTORS } from "../utilities/Constants";
import axios from "axios";

// constants ///////////////////////////////////////////////////////////////////
// none

// EnigmaMachine component /////////////////////////////////////////////////////
// This component simulates the Enigma machine UI and logic
export default function EnigmaMachine({ config, user_id, config_id}) {
    // --- Plugboard setup ---
    // Use a ref to persist the plugboard instance across renders
    const plugboardRef = useRef(new Plugboard());

    // On config change, set up plugboard pairs
    useEffect(() => {
        const plugboard = plugboardRef.current;
        // Reset plugboard before adding pairs to prevent duplicate mapping errors
        // when the config changes or when navigating between pages.
        plugboard.reset(); // Clear previous mappings before adding new pairs
        config.plugboardPairs.forEach(([letterOne, letterTwo]) => {
            plugboard.addPair(letterOne, letterTwo);
        });
    }, [config]);

    // --- Rotors setup ---
    // Use a ref to persist the rotors array across renders
    const rotorsRef = useRef(
        config.rotors.map((rotor) => {
            const rotorSpec = ROTORS[rotor.spec]
            return new Rotator(rotorSpec.wiring, rotorSpec.turnover, 
                               rotor.ringSetting, rotor.startPosition);
        })
    );

    // --- Reflector setup ---
    // Use a ref to persist the reflector instance
    const reflectorRef = useRef(new Reflector(REFLECTORS[config.reflector].wiring));

    // --- State for input/output and rotor positions ---
    // Save user's input
    const [inputMessage, setInputMessage] = useState("");
    // Save encoded output
    const [outputMessage, setOutputMessage] = useState("");
    // Track current rotor positions
    const [rotorPositions, setRotorPositions] = useState(
        rotorsRef.current.map((r) => r.rotorPos));
    // Save the save button response
    const [saveStatus, setSaveStatus] = useState("");

    // State for saved messages
    const [savedMessages, setSavedMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messagesError, setMessagesError] = useState("");
    const [deletingMessageId, setDeletingMessageId] = useState(null);

    // Fetch saved messages when user_id changes
    useEffect(() => {
        if (!user_id) return;
        setLoadingMessages(true);
        setMessagesError("");
        axios.get(`/messages?user_id=${user_id}`)
            .then(res => {
                setSavedMessages(res.data.messages || []);
            })
            .catch(err => {
                setMessagesError("Failed to load saved messages.");
            })
            .finally(() => setLoadingMessages(false));
    }, [user_id]);

    // --- Save message handler ---
    const handleSaveMessage = async () => {
        setSaveStatus("");
        if (!outputMessage.trim()) {
            setSaveStatus("Nothing to save.");
            return;
        }
        try {
            const response = await axios.post("/messages", {
                user_id,
                config_id,
                message_text: outputMessage
            });
            if (response.data && response.data.message === "Message saved successfully") {
                setSaveStatus("Message saved!");
            } else {
                setSaveStatus("Failed to save message.");
            }
        } catch (err) {
            setSaveStatus("Error saving message.");
        }
    };
    // Restart message
    const handleRestartMessage = () => {
        setInputMessage("");
        setOutputMessage("");
        setSaveStatus("");
        rotorsRef.current.forEach(rotor => rotor.restart()); 
        setRotorPositions(rotorsRef.current.map(r => r.rotorPos));
    };

    // Delete a saved message
    const handleDeleteMessage = async (message_id) => {
        if (!window.confirm("Delete this message?")) return;
        setDeletingMessageId(message_id);
        try {
            await axios.delete(`/messages/${message_id}`);
            setSavedMessages((msgs) => msgs.filter((msg) => msg.message_id !== message_id));
        } catch (err) {
            alert("Failed to delete message.");
        } finally {
            setDeletingMessageId(null);
        }
    };

    // --- Handle key presses from the keyboard ---
    const handleKeyPress = (letter) => {
        if (letter === " ") {
            // If space, add space to both input and output (no encoding)
            setInputMessage((prev) => prev + " ");
            setOutputMessage((prev) => prev + " ");
        } else {
            // Encode the letter using Enigma logic
            const encoded = encodeLetter(letter, rotorsRef.current, 
                                                 plugboardRef.current, 
                                                 reflectorRef.current);
            // Update input, output, and rotor positions
            setInputMessage((prev) => prev + letter);
            setOutputMessage((prev) => prev + encoded);
            setRotorPositions(rotorsRef.current.map((r) => r.rotorPos));
        }
    };

    // --- Render the Enigma Machine UI ---
    return (
        <div className="enigma-machine">
            {/* Rotor panel at the top showing current rotor positions */}
            <div className="rotor-panel">
                <div className="rotor-display">
                    <h3>Rotor Positions</h3>
                    <div className="rotor-windows">
                        {rotorPositions.map((pos, index) => (
                            <div key={index} className="rotor-window">
                                <div className="rotor-number">Rotor {index + 1}</div>
                                <div className="rotor-position">{pos}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content: left = input/output, right = lampboard + keyboard */}
            <div className="main-content">
                {/* Left: Input/Output message panel */}
                <div className="message-panel">
                    <div className="input-display">
                        <h4>Input</h4>
                        <div className="message-text">{inputMessage}</div>
                    </div>
                    <div className="output-display">
                        <h4>Output</h4>
                        <div className="message-text">{outputMessage}</div>
                    </div>

                    {/* Restart Message Button */}
                    <button
                        onClick={handleRestartMessage}
                        style={{
                            marginTop: "12px",
                            padding: "10px 20px",
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "16px",
                            cursor: "pointer"
                        }}
                    >
                        Restart Message
                    </button>
                    
                    {/* Save Message Button */}
                    <button
                        onClick={handleSaveMessage}
                        style={{
                            marginTop: "12px",
                            padding: "10px 20px",
                            background: "#3498db",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "16px",
                            cursor: "pointer"
                        }}
                    >
                        Save Message
                    </button>

                    {/* Save status feedback */}
                    {saveStatus && (
                        <div style={{ marginTop: "8px", color: saveStatus === "Message saved!" ? "#27ae60" : "#e74c3c" }}>
                            {saveStatus}
                        </div>
                    )}
                    {/* Saved Messages Section */}
                    <div style={{ marginTop: 32 }}>
                        <h4>Saved Messages</h4>
                        {loadingMessages ? (
                            <div>Loading...</div>
                        ) : messagesError ? (
                            <div style={{ color: "#e74c3c" }}>{messagesError}</div>
                        ) : savedMessages.length === 0 ? (
                            <div style={{ color: "#888" }}>No saved messages yet.</div>
                        ) : (
                            <ul style={{ maxHeight: 200, overflowY: "auto", padding: 0, listStyle: "none" }}>
                                {savedMessages.map(msg => (
                                    <li key={msg.message_id} style={{ background: "#222", color: "#fff", marginBottom: 8, padding: 10, borderRadius: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: 14, color: "#aaa" }}>Config ID: {msg.config_id}</div>
                                            <div style={{ fontSize: 16 }}>{msg.message_text}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteMessage(msg.message_id)}
                                            disabled={deletingMessageId === msg.message_id}
                                            style={{
                                                marginLeft: 16,
                                                background: "#e74c3c",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 4,
                                                padding: "6px 14px",
                                                cursor: deletingMessageId === msg.message_id ? "not-allowed" : "pointer",
                                                fontSize: 14
                                            }}
                                        >
                                            {deletingMessageId === msg.message_id ? "Deleting..." : "Delete"}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right: Lampboard above Keyboard */}
                <div className="keyboard-section">
                    {/* Lampboard: lights up the last encoded letter */}
                    <div className="lampboard">
                        <h3>Lampboard</h3>
                        <div className="lamp-display">
                            <div className="lamp-row">
                                {['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'].map(letter => (
                                    <div key={letter} className={`lamp ${outputMessage.slice(-1) === letter ? 'lit' : ''}`}>
                                        {letter}
                                    </div>
                                ))}
                            </div>
                            <div className="lamp-row">
                                {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'].map(letter => (
                                    <div key={letter} className={`lamp ${outputMessage.slice(-1) === letter ? 'lit' : ''}`}>
                                        {letter}
                                    </div>
                                ))}
                            </div>
                            <div className="lamp-row">
                                {['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'].map(letter => (
                                    <div key={letter} className={`lamp ${outputMessage.slice(-1) === letter ? 'lit' : ''}`}>
                                        {letter}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Keyboard: virtual keyboard for input */}
                    <div className="keyboard-panel">
                        <EnigmaKeyboard onKeyPress={handleKeyPress} />
                    </div>
                </div>
            </div>
        </div>
    );
}