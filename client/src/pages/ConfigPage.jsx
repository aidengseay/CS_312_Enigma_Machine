// imports /////////////////////////////////////////////////////////////////////

import { useState } from "react";
import EnigmaMachine from "../components/EnigmaMachine";
import RotorSettings from "../components/RotorSettings";
import PlugboardSettings from "../components/PlugboardSettings";

// configuration function //////////////////////////////////////////////////////

    // test config file
    // const config = {
    //     rotors: [
    //         { spec: "III", ringSetting: 0, startPosition: 0 },
    //         { spec: "II", ringSetting: 0, startPosition: 0 },
    //         { spec: "I", ringSetting: 0, startPosition: 0 },
    //     ],
    //     reflector: "UKW_B",
    //     plugboardPairs: [
    //         ["A", "B"],
    //         ["C", "D"],
    //     ],
    // };
    // const config_id = 1;


export default function ConfigPage({ user_id }) {

    // set initial rotor positions
    const [rotor1, setRotor1] = useState({
        spec: "I",
        startPosition: 0,
        ringSetting: 0,
    });

    const [rotor2, setRotor2] = useState({
        spec: "I",
        startPosition: 0,
        ringSetting: 0,
    });

    const [rotor3, setRotor3] = useState({
        spec: "I",
        startPosition: 0,
        ringSetting: 0,
    });

    // set initial reflector position
    const [reflector, setReflector] = useState("UKW_B");

    // set initial plugboard  state
    const [plugboardPairs, setPlugboardPairs] = useState([]);

    // set initial config status
    const [submittedConfig, setSubmittedConfig] = useState(null);

    // when the submit button is pressed
    function handleSubmit(event) {

        event.preventDefault();

        // craft the config package
        const config = {
            rotors: [rotor1, rotor2, rotor3],
            reflector: reflector,
            plugboardPairs: plugboardPairs,
        };

        console.log("Submitted Config:", config);

        // TODO: send config to the database

        // TODO: get the config to get the config id

        // TODO: call the enigma machine with new config

        setSubmittedConfig(config);
  }

  // check if submitted the config file
  if(submittedConfig) {
    return <EnigmaMachine config={submittedConfig} user_id={user_id} config_id={1}/>
  }

  else {
    return (
        <div>
            <h1>Enigma Machine Configuration Page</h1>

            <form onSubmit={handleSubmit}>

                <h2>Rotors Selection</h2>
                <RotorSettings num={1} values={rotor1} setValues={setRotor1} />
                <RotorSettings num={2} values={rotor2} setValues={setRotor2} />
                <RotorSettings num={3} values={rotor3} setValues={setRotor3} />

                <h2>Reflector Selection</h2>
                <select name="Reflector" value={reflector} onChange={(e) => setReflector(e.target.value)}>
                    <option value="UKW_B">UKW-B</option>
                    <option value="UKW_C">UKW-C</option>
                </select>

                <h2>Plugboard Section</h2>
                <PlugboardSettings plugboardPairs={plugboardPairs} setPlugboardPairs={setPlugboardPairs}/>

                <button type="submit">Submit Configuration</button>
            </form>
        </div>
    );
  }
}