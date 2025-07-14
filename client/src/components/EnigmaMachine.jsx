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