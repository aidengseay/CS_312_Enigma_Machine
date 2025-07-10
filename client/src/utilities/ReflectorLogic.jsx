// imports /////////////////////////////////////////////////////////////////////

// none

// constants ///////////////////////////////////////////////////////////////////

const UNICODE_A = 65

// reflector class /////////////////////////////////////////////////////////////

export class Reflector {

    /*
    Description: This class represents a single Enigma reflector. This is one of 
    three rotators in the enigma machine. There are 2 different reflectors to
    choose from.
    */

    constructor(wiring) {

        /*
        Description: Initializes a reflector object.

        Parameters:

            wiring (str): The pattern of wiring that defines a kind of reflector 
                          (UKW-B or UKW-C)

        Return None
        */

        this.wiring = wiring;
    }

    reflect(char) {

        /*
        Description: Completes a single substitution to go back through the
                     rotors

        Parameters:

            char (str): The single character to get substituted for

        Return (str): character that is encoded
        */

        // does a single substitution to go back through the rotors
        const index = char.toUpperCase().charCodeAt(0) - UNICODE_A;
        return this.wiring[index];
    }
}