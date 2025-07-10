// imports /////////////////////////////////////////////////////////////////////

// none

// constants ///////////////////////////////////////////////////////////////////

const NUM_LETTERS = 26
const UNICODE_A = 65

// rotator class ///////////////////////////////////////////////////////////////

export class Rotator {

    /*
    Description: This class represents a single Enigma rotor. This is one of 
    three rotators in the enigma machine. There are 5 different rotors.
    */

    constructor(wiring, notch, ringSetting, rotorPos) {

        /*
        Description: Initializes a rotator object.

        Parameters:

            wiring (str): The pattern of wiring that defines a kind of rotor 
                          (I-V)
            notch (str): The letter where the notch is at to turn the rotator
            ring_setting (int): The offset of the rotor's internal wiring (0-25)
                                changing the turnover index
            rotor_position (int): Determines where the rotor starts rotating 
                                  (0-25)

        Return None
        */

        // set variables to class attributes
        this.wiring = wiring;
        this.notch = notch;
        this.ringSetting = ringSetting;
        this.rotorPos = rotorPos;

        // calculate the turnover index from the ring setting
        this.turnOverIndex = (notch.charCodeAt(0) - UNICODE_A - ringSetting + 
                                                    NUM_LETTERS) % NUM_LETTERS;

        // reverse the wiring diagram for return trip
        this.reverseWiring = Array(NUM_LETTERS);
        for(let index = 0; index < wiring.length; index++) {
            const char = wiring[index];
            this.reverseWiring[char.charCodeAt(0) - UNICODE_A]  = 
                                         String.fromCharCode(index + UNICODE_A);
        }
    }

    step() {

        /*
        Description: Steps the rotor forward by one position

        Parameters: None

        Return: None
        */

        this.rotorPos = (this.rotorPos + 1) % NUM_LETTERS;
    }

    atNotch() {

        /*
        Description: Returns true if the rotor is at its turnover position

        Parameters: None

        Return (bool): true if at turnover position, false if not
        */

        return this.rotorPos === this.turnOverIndex;
    }

    toReflector(char) {

        /*
        Description: Manipulates character with the rotator going to the
                     the reflector

        Parameters:

            char (str): The character that will be encoded

        Return (str): Encoded character
        */

        // convert letter to index
        const inputIndex = char.charCodeAt(0) - UNICODE_A;

        // convert pin the signal enters on the wiring wheel to get letter
        const shiftedIndex = (inputIndex + this.rotorPos - 
                              this.ringSetting + NUM_LETTERS) %  NUM_LETTERS;

        const wiredLetter = this.wiring[shiftedIndex];

        // reverse pin conversion for the next rotator and return letter
        const outputIndex = (wiredLetter.charCodeAt(0) - UNICODE_A - 
             this.rotorPos + this.ringSetting + NUM_LETTERS) % NUM_LETTERS;
        return String.fromCharCode(outputIndex + UNICODE_A);
    }

    fromReflector(char) {

        /*
        Description: Manipulates character with the rotator going from the
                     the reflector

        Parameters:

            char (str): The character that will be encoded

        Return (str): Encoded character
        */

        // convert letter to index
        const inputIndex = char.charCodeAt(0) - UNICODE_A;

        // convert pin the signal enters on the wiring wheel to get letter
        const shiftedIndex = (inputIndex + this.rotorPos - 
                              this.ringSetting + NUM_LETTERS) %  NUM_LETTERS;

        const wiredLetter = this.reverseWiring[shiftedIndex];

        // reverse pin conversion for the next rotator and return letter
        const outputIndex = (wiredLetter.charCodeAt(0) - UNICODE_A - 
             this.rotorPos + this.ringSetting + NUM_LETTERS) % NUM_LETTERS;
        return String.fromCharCode(outputIndex + UNICODE_A);
    }
}