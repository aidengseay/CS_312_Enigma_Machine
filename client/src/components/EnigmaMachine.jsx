// imports /////////////////////////////////////////////////////////////////////

import { useState, useRef, useEffect } from "react";
import EnigmaKeyboard from "./Keyboard";
import { Rotator } from "../utilities/RotorLogic";
import { Plugboard } from "../utilities/PlugboardLogic";
import { Reflector } from "../utilities/ReflectorLogic";
import { encodeLetter } from "../utilities/EncodeLogic";
import { ROTORS, REFLECTORS } from "../utilities/Constants";

// constants ///////////////////////////////////////////////////////////////////

// none

// keyboard function ///////////////////////////////////////////////////////////

export default function EnigmaMachine({ config }) {
    
    // setup the plugboard
    const plugboardRef = useRef(new Plugboard());

    useEffect(() => {
        const plugboard = plugboardRef.current;
        config.plugboardPairs.forEach(([letterOne, letterTwo]) => {
            plugboard.addPair(letterOne, letterTwo);
        });
    }, [config]);

    // setup rotors
    const rotorsRef = useRef(
        config.rotors.map((rotor) => {
            const rotorSpec = ROTORS[rotor.spec]
            return new Rotator(rotorSpec.wiring, rotorSpec.turnover, 
                               rotor.ringSetting, rotor.startPosition);
        })
    );

    // setup reflector
    const reflectorRef = useRef(new Reflector(REFLECTORS[config.reflector].wiring));

    // display results
    const [inputMessage, setInputMessage] = useState("");
    const [outputMessage, setOutputMessage] = useState("");
    const [rotorPositions, setRotorPositions] = useState(
        rotorsRef.current.map((r) => r.rotorPos));

    // handle key presses
    const handleKeyPress = (letter) => {
        console.log(letter);
        const encoded = encodeLetter(letter, rotorsRef.current, 
                                             plugboardRef.current, 
                                             reflectorRef.current);

        setInputMessage((prev) => prev + letter);
        setOutputMessage((prev) => prev + encoded);
        setRotorPositions(rotorsRef.current.map((r) => r.rotorPos));
    };

    return (
        <div>
            <h1>Enigma Machine Emulator</h1>
            <p>Input: {inputMessage}</p>
            <p>Output: {outputMessage}</p>

            <h3>Rotor Positions:</h3>
        <ul>
            {rotorPositions.map((pos, index) => (
                <li key={index}>Rotor {index + 1}: {pos}</li>
            ))}
        </ul>

            <EnigmaKeyboard onKeyPress={handleKeyPress} />
        </div>
    );
}