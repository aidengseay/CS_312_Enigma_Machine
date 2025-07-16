// imports /////////////////////////////////////////////////////////////////////

import { useState } from "react";

// plugboard setting function //////////////////////////////////////////////////

export default function PlugboardSettings({ plugboardPairs, setPlugboardPairs }) {

    // get initial letter
    const [firstLetter, setFirstLetter] = useState("");
    const [secondLetter, setSecondLetter] = useState("");

    // add a plugboard letter pair
    function addPair() {

        // check if first and second letter exist
        if ( firstLetter && secondLetter ) {
        
            // append the first and second letters to plugboard list
            setPlugboardPairs([...plugboardPairs, [firstLetter, secondLetter]]);

            // reset first and second letter
            setFirstLetter("");
            setSecondLetter("");
        }
    }

  // remove a letter pair from the plugboard list
  function removePair(index) {

        // get the current value an remove necessary index from list
        const updated = [...plugboardPairs];
        updated.splice(index, 1);

        // set the new updated list without value at index
        setPlugboardPairs(updated);
  }

  // tracks list of all letters without the 2d list pairing
  const usedLetters = plugboardPairs.flat();

  return (
    <div>
        {/* get the first letter for plugboard */}
        <select value={firstLetter} onChange={(event) => setFirstLetter(event.target.value)}>

            <option value="">Select</option>

            {/* only enable letter if available */}
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
            <option key={letter} value={letter} disabled={usedLetters.includes(letter) || secondLetter === letter}>
                {letter}
            </option>
            ))}
      </select>

        {/* get the second letter for the plugboard */}
        <select value={secondLetter} onChange={(event) => setSecondLetter(event.target.value)}>

            <option value="">Select</option>

            {/* only enable the second letter if available */}
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                <option key={letter} value={letter} disabled={usedLetters.includes(letter) || firstLetter === letter}>
                    {letter}
                </option>
            ))}
      </select>

      <button type="button" onClick={addPair}>Add Pair To Plugboard</button>

        {/* display all current plugboard pairs */}
        <ul>
            {plugboardPairs.map(([first, second], index) => (
                <li key={index}>
                    <p>{first} and {second} swap</p>
                    <button type="button" onClick={() => removePair(index)}>Remove</button>
                </li>
            ))}
        </ul>

    </div>
  );
}
