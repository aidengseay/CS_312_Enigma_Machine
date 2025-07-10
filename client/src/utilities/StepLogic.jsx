// imports /////////////////////////////////////////////////////////////////////

// none

// constants ///////////////////////////////////////////////////////////////////

// none

// step function ///////////////////////////////////////////////////////////////

export function stepRotors(rotors) {

    /*
    Description: Checks what stage each rotor is at and rotates them in
                 relation to one another

    Parameters:
    
        rotors (list): A list of the three rotors left, middle, and right.

    Return None
    */

    const [right, middle, left] = rotors;

    // check if left rotor should step
    if(middle.atNotch()) {
        middle.step();
        left.step();
    }

    // check if middle rotor should step
    if(right.atNotch()) {
        middle.step();
    }

    // step the right rotor
    right.step();
}