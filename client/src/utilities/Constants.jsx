// imports /////////////////////////////////////////////////////////////////////

// none

// constants ///////////////////////////////////////////////////////////////////

export const NUM_LETTERS = 26
export const UNICODE_A = 65

export const ENTRY_DISC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// rotor disks (5 to choose from - pick 3)
export const ROTORS = {
    I: {
        wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
        turnover: "Q", // notch is Y
    },

    II: {
        wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE",
        turnover: "E", // notch is M
    },

    III: {
        wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO",
        turnover: "V", // notch is D
    },

    IV: {
        wiring: "ESOVPZJAYQUIRHXLNFTGKDCMWB",
        turnover: "J", // notch is R
    },
  
    V: {
        wiring: "VZBRGITYUPSDNHLXAWMJQOFECK",
        turnover: "Z", // notch is H
    },
};

// reflectors (2 to choose from - pick 1)
export const REFLECTORS = {

    UKW_B: {
        wiring: "YRUHQSLDPXNGOKMIEBFZCWVJAT",
    },

    UKW_C: {
        wiring: "FVPJIAOYEDRZXWGCTKUQSBNMHL",
    }
}
