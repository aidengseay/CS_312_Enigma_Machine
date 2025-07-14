// imports /////////////////////////////////////////////////////////////////////

import { stepRotors } from "./StepLogic"

// constants ///////////////////////////////////////////////////////////////////

// none

// encoding function ///////////////////////////////////////////////////////////

export function encodeLetter(inputLetter, rotors, plugboard, reflector) {

    /*
    Description: Encodes a single letter with configurations through enigma
                 machine.

    Parameters: 

        inputLetter (str): Single uppercase letter.
        rotors (Array): Array of 3 Rotator instances [right, middle, left].
        plugboard (Plugboard): Plugboard instance.
        reflector (Reflector): Reflector instance.

    Returns (str): Encoded letter
    */

    // assume character is between A-Z and set to uppercase
    inputLetter = inputLetter.toUpperCase();

    // step rotator before encoding
    stepRotors(rotors);

    // keyboard to plugboard to rotor
    let char = plugboard.swap(inputLetter);

    console.log(char);

    // forward pass through the rotors going right to left
    for(const rotor of rotors) {
        char = rotor.toReflector(char);
        console.log(char);
    }

    // go through the reflector
    char = reflector.reflect(char);

    // backwards pass through the rotors going left to right
    for (let index = rotors.length - 1; index >= 0; index--) {
        char = rotors[index].fromReflector(char);
    }

    // rotor to plugboard to lampboard
    char = plugboard.swap(char);

    // return encrypted result
    return char;
}