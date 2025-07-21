// imports /////////////////////////////////////////////////////////////////////

import { useState, useEffect } from "react";
import EnigmaMachine from "../components/EnigmaMachine";
import RotorSettings from "../components/RotorSettings";
import PlugboardSettings from "../components/PlugboardSettings";
import axios from "axios";

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
        spec: "II",
        startPosition: 0,
        ringSetting: 0,
    });

    const [rotor3, setRotor3] = useState({
        spec: "III",
        startPosition: 0,
        ringSetting: 0,
    });

    // set initial reflector position
    const [reflector, setReflector] = useState("UKW_B");

    // set initial plugboard  state
    const [plugboardPairs, setPlugboardPairs] = useState([]);

    // set initial config status
    const [submittedConfig, setSubmittedConfig] = useState(null);

    // State for saved configs management
    // Array of user's saved configurations
    const [savedConfigs, setSavedConfigs] = useState([]);
    // Loading state for fetching configs
    const [loadingConfigs, setLoadingConfigs] = useState(false);
    // Error message for config operations
    const [configsError, setConfigsError] = useState("");
    // ID of config being deleted (for UI feedback)
    const [deletingConfigId, setDeletingConfigId] = useState(null);
    // Loading state for save operations
    const [savingConfig, setSavingConfig] = useState(false);
    // Success/error messages for save operations
    const [saveStatus, setSaveStatus] = useState("");

    // Fetch saved configs when user_id changes
    useEffect(() => {
        if (!user_id) return;
        fetchSavedConfigs();
    }, [user_id]);

    /**
     * Fetch saved configurations from the database
     */
    const fetchSavedConfigs = async () => {
        setLoadingConfigs(true);
        setConfigsError("");
        try {
            const response = await axios.get(`/configs?user_id=${user_id}`);
            setSavedConfigs(response.data.configs || []);
        } catch (err) {
            setConfigsError("Failed to load saved configurations.");
        } finally {
            setLoadingConfigs(false);
        }
    };

    /**
     * Load a saved configuration into the form
     * Populates all form fields with the selected configuration's settings
     * @param {Object} config - The configuration object to load
     */
    const handleLoadConfig = (config) => {
        setRotor1(config.rotors[0]);
        setRotor2(config.rotors[1]);
        setRotor3(config.rotors[2]);
        setReflector(config.reflector);
        setPlugboardPairs(config.plugboardPairs);
        setSaveStatus("Configuration loaded!");
        setTimeout(() => setSaveStatus(""), 2000);
    };

    /**
     * Delete a saved configuration
     * Shows confirmation dialog and removes the config from the saved list
     * @param {number} config_id - The ID of the configuration to delete
     */
    const handleDeleteConfig = async (config_id) => {
        if (!window.confirm("Delete this configuration?")) return;
        setDeletingConfigId(config_id);
        try {
            await axios.delete(`/configs/${config_id}`);
            setSavedConfigs((configs) => configs.filter((config) => config.config_id !== config_id));
        } catch (err) {
            alert("Failed to delete configuration.");
        } finally {
            setDeletingConfigId(null);
        }
    };

    /**
     * Handle form submission (legacy function - now replaced by handleSaveAndUse)
     * This function is kept for potential future use but is not currently called
     */
    // function handleSubmit(event) {
    //     event.preventDefault();

    //     // Create config object from current form state
    //     const config = {
    //         rotors: [rotor1, rotor2, rotor3],
    //         reflector: reflector,
    //         plugboardPairs: plugboardPairs,
    //     };

    //     console.log("Submitted Config:", config);

    //     // TODO: send config to the database

    //     // TODO: get the config to get the config id

    //     // TODO: call the enigma machine with new config

    //     setSubmittedConfig(config);
    // }

    /**
     * Save and use the current configuration
     * Prompts user for optional config name, saves if provided, then uses the config
     * This combines saving and using into a single action for better UX
     */
    const handleSaveAndUse = async () => {
        setSavingConfig(true);
        setSaveStatus("");
        
        // Prompt for optional configuration name
        const configName = prompt("Enter a name for this configuration (optional):");
        
        // Create config object from current form state
        const config = {
            rotors: [rotor1, rotor2, rotor3],
            reflector: reflector,
            plugboardPairs: plugboardPairs,
        };

        try {
            // Save config to database if name was provided
            if (configName) {
                const newConfig = await axios.post("/configs", {
                    user_id,
                    name: configName,
                    rotors: [rotor1, rotor2, rotor3],
                    reflector,
                    plugboardPairs});
                setSavedConfigs((configs) => [newConfig, ...configs]);
                setSaveStatus("Configuration saved and loaded!");
            } else {
                setSaveStatus("Configuration loaded!");
            }
            
            // Use the configuration with the Enigma machine
            setSubmittedConfig(config);
        } catch (err) {
            setSaveStatus("Error saving configuration.");
        } finally {
            setSavingConfig(false);
            setTimeout(() => setSaveStatus(""), 3000);
        }
    };

  // Check if configuration has been submitted, show the Enigma machine
  // TODO: we need to change the config id to an actual value
  if(submittedConfig) {
    return <EnigmaMachine config={submittedConfig} user_id={user_id} config_id={1}/>
  }

  else {
    return (
        <div className="config-page-container">
            <div className="config-form-panel">
                <div className="config-title">Enigma Machine Configuration</div>
                
                {/* Saved Configurations Section - Display user's saved configs */}
                <div className="saved-configs-section">
                    <div className="config-section-header">Saved Configurations</div>
                    {loadingConfigs ? (
                        <div className="loading-text">Loading configurations...</div>
                    ) : configsError ? (
                        <div className="error-text">{configsError}</div>
                    ) : savedConfigs.length === 0 ? (
                        <div className="no-configs-text">No saved configurations yet.</div>
                    ) : (
                        <div className="saved-configs-list">
                            {savedConfigs.map(config => (
                                <div key={config.config_id} className="saved-config-item">
                                    <div className="config-info">
                                        <div className="config-name">ID:{config.config_id}, Name:{config.name || "Unnamed Config"}</div>
                                        <div className="config-details">
                                            Rotors: {config.rotors.map(r => r.spec).join('-')} | 
                                            Reflector: {config.reflector} | 
                                            Plugboard: {config.plugboardPairs.length} pairs
                                        </div>
                                    </div>
                                    <div className="config-actions">
                                        <button
                                            onClick={() => handleLoadConfig(config)}
                                            className="config-btn config-btn-load"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => handleDeleteConfig(config.config_id)}
                                            disabled={deletingConfigId === config.config_id}
                                            className="config-btn config-btn-delete"
                                        >
                                            {deletingConfigId === config.config_id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form>
                    <div className="rotor-section-row">
                        <div className="config-section">
                            <div className="config-section-header">Rotors Selection</div>
                            <div className="rotor-settings-row">
                                <div className="rotor-settings-col"><RotorSettings num={1} values={rotor1} setValues={setRotor1} /></div>
                                <div className="rotor-settings-col"><RotorSettings num={2} values={rotor2} setValues={setRotor2} /></div>
                                <div className="rotor-settings-col"><RotorSettings num={3} values={rotor3} setValues={setRotor3} /></div>
                            </div>
                        </div>
                    </div>
                    <div className="config-bottom-row">
                        <div className="config-bottom-col">
                            <div className="config-section">
                                <div className="config-section-header">Reflector Selection</div>
                                <select className="reflector-select" name="Reflector" value={reflector} onChange={(e) => setReflector(e.target.value)}>
                                    <option value="UKW_B">UKW-B</option>
                                    <option value="UKW_C">UKW-C</option>
                                </select>
                            </div>
                        </div>
                        <div className="config-bottom-col">
                            <div className="config-section">
                                <div className="config-section-header">Plugboard Selection</div>
                                <div className="plugboard-section">
                                    <PlugboardSettings plugboardPairs={plugboardPairs} setPlugboardPairs={setPlugboardPairs}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Action Buttons - Single button that saves (optional) and uses the configuration */}
                    <div className="config-actions-row">
                        <button 
                            type="button" 
                            onClick={handleSaveAndUse}
                            disabled={savingConfig}
                            className="config-submit-btn"
                        >
                            {savingConfig ? "Loading..." : "Use Configuration"}
                        </button>
                    </div>
                    {/* Status Messages - Show success/error feedback */}
                    {saveStatus && (
                        <div className={`save-status ${saveStatus.includes("Error") ? "error" : "success"}`}>
                            {saveStatus}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
  }
}