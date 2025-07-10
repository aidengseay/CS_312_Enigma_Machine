// imports /////////////////////////////////////////////////////////////////////

// none

// constants ///////////////////////////////////////////////////////////////////

// none

// plugboard class /////////////////////////////////////////////////////////////

export class Plugboard {

    /*
    Description: This class represents the plugboard state.
    */

    constructor() {

        /*
        Description: Initializes a plugboard object.

        Parameters: None

        Return: None
        */

        this.mapping = {}
    }

    addPair(letterOne, letterTwo ) {

        /*
        Description: Add a pair of letters to the plugboard

        Parameters: None

            letterOne (str): letter to map with letterTwo
            letterTwo (str): letter to map with letterOne

        Return: None
        */

        letterOne = letterOne.toUpperCase();
        letterTwo = letterTwo.toUpperCase();

        // check for errors
        if(letterOne === letterTwo) {
            throw new Error("Cannot map letter to itself");
        }

        if (this.hasLetter(letterOne) || this.hasLetter(letterTwo)) {
            throw new Error("One or both letters are already mapped.");
        }

        // map the letters on the plugboard
        this.mapping[letterOne] = letterTwo;
        this.mapping[letterTwo] = letterOne;
    }

    removePair(letter) {

        /*
        Description: Removes a pair of letters off the plugboard

        Parameters:

            letter (str): letter to be removed

        Return: None
        */

        letter = letter.toUpperCase();

        // get the letter pair
        const mappedLetter = this.mapping[letter];

        // check for errors
        if(!mappedLetter) {
            throw new Error(`No plugboard mapping for letter: ${letter}`);
        }

        // remove from plugboard
        delete this.mapping[letter];
        delete this.mapping[mappedLetter];
    }

    swap(letter) {

        /*
        Description: Swaps the letter if changed in plugboard OR outputs the
                     same letter.

        Parameters:

            letter (str): letter to be swapped

        Return (str): swapped letter OR same letter
        */

        letter = letter.toUpperCase();
        return this.mapping[letter] || letter; 
    }

    hasLetter(letter) {

        /*
        Description: Returns true if plugboard already has letter, false if not

        Parameters:

            letter (str): letter to check if in plugboard

        Return (bool): true if letter in plugboard
        */

        letter = letter.toUpperCase();
        return !!this.mapping[letter];

    }



}