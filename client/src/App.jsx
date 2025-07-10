// imports /////////////////////////////////////////////////////////////////////

import React from 'react';
import EnigmaMachine from './components/EnigmaMachine'

// constants ///////////////////////////////////////////////////////////////////

// none

// keyboard function ///////////////////////////////////////////////////////////

function App() {

    // test config file
    const config = {
        rotors: [
            { spec: 'III', ringSetting: 0, startPosition: 0 },
            { spec: 'II', ringSetting: 0, startPosition: 0 },
            { spec: 'I', ringSetting: 0, startPosition: 0 },
        ],
        reflector: 'UKW_B',
        plugboardPairs: [
            ['A', 'B'],
            ['C', 'D'],
        ],
    };

    // render page
    return (
        <div>
            <EnigmaMachine config={config}/>
        </div>
    );
}

export default App;