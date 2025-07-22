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


// ConfigPage component for managing Enigma configurations
export default function ConfigPage({ user_id, onConfigSaved, onForceConfigPage }) {
    // State for each rotor
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
    // State for reflector
    const [reflector, setReflector] = useState("UKW_B");
    // State for plugboard pairs
    const [plugboardPairs, setPlugboardPairs] = useState([]);
    // State for the currently submitted config (for EnigmaMachine)
    const [submittedConfig, setSubmittedConfig] = useState(null);
    // State for the config_id of the submitted config
    const [submittedConfigId, setSubmittedConfigId] = useState(null);
    // State for saved configs management
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
    // Loading state for EnigmaMachine transition
    const [loadingEnigma, setLoadingEnigma] = useState(false);

    // Fetch saved configs when user_id changes
    useEffect(() => {
        if (!user_id) return;
        fetchSavedConfigs();
    }, [user_id]);

    // Fetch saved configurations from the database
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

    // Load a saved configuration into the form
    // Populates all form fields with the selected configuration's settings
    const handleLoadConfig = (config) => {
        setRotor1(config.rotors[0]);
        setRotor2(config.rotors[1]);
        setRotor3(config.rotors[2]);
        setReflector(config.reflector);
        setPlugboardPairs(config.plugboardPairs);
        setSaveStatus("Configuration loaded!");
        setTimeout(() => setSaveStatus(""), 2000);
        // Set submittedConfig and submittedConfigId so EnigmaMachine gets correct config_id and name
        setSubmittedConfig({
            rotors: config.rotors,
            reflector: config.reflector,
            plugboardPairs: config.plugboardPairs,
            name: config.name
        });
        setSubmittedConfigId(config.config_id);
    };

    // Delete a saved configuration
    // Shows confirmation dialog and removes the config from the saved list
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

    // Save and use the current configuration
    // Prompts user for required config name, saves, then uses the config
    const handleSaveAndUse = async () => {
        setSavingConfig(true);
        setSaveStatus("");
        // Prompt for required configuration name
        let configName = null;
        while (true) {
            configName = prompt("Enter a name for this configuration (required):");
            if (configName === null) {
                setSavingConfig(false);
                return;
            }
            if (configName.trim() !== "") break;
            alert("You must enter a name for the configuration.");
        }
        try {
            let configIdToUse = null;
            setLoadingEnigma(true); 
            if (configName) {
                // Save config to backend
                const response = await axios.post("/configs", {
                    user_id,
                    name: configName,
                    rotors: [rotor1, rotor2, rotor3],
                    reflector,
                    plugboardPairs});
                if (response.data && response.data.config && response.data.config.config_id) {
                    setSaveStatus("Configuration saved and loaded!");
                    // Reload the page to ensure all configs are up to date
                    window.location.reload();
                    return;
                } else {
                    setSaveStatus("Error: Invalid config returned from backend.");
                    setSavingConfig(false);
                    setLoadingEnigma(false);
                    return;
                }
            } else {
                setSaveStatus("Configuration loaded!");
                // Try to find a matching config in savedConfigs
                const match = savedConfigs.find(cfg =>
                    Array.isArray(cfg.rotors) &&
                    cfg.rotors.length === 3 &&
                    cfg.rotors.every(r => r.spec) &&
                    cfg.reflector &&
                    JSON.stringify(cfg.rotors) === JSON.stringify([rotor1, rotor2, rotor3]) &&
                    cfg.reflector === reflector &&
                    JSON.stringify(cfg.plugboardPairs) === JSON.stringify(plugboardPairs)
                );
                if (match) {
                    configIdToUse = match.config_id;
                    setSubmittedConfig({
                        rotors: match.rotors,
                        reflector: match.reflector,
                        plugboardPairs: match.plugboardPairs,
                        name: match.name
                    });
                } else {
                    setSavingConfig(false);
                    setLoadingEnigma(false);
                    setSaveStatus("Please save the configuration before using it.");
                    setTimeout(() => setSaveStatus("") , 3000);
                    return;
                }
            }
            setSubmittedConfigId(configIdToUse);
            if (onConfigSaved) onConfigSaved();
        } catch (err) {
            setSaveStatus("Error saving configuration.");
        } finally {
            setSavingConfig(false);
            setLoadingEnigma(false);
            setTimeout(() => setSaveStatus(""), 3000);
        }
    };

    // Handler to go back to config page from EnigmaMachine
    const handleBackToConfig = () => {
        setSubmittedConfig(null);
        setSubmittedConfigId(null);
        if (onForceConfigPage) onForceConfigPage();
    };

    // Show loading spinner/message if loadingEnigma is true
    if (loadingEnigma) {
        return (
            <div style={{textAlign: "center", marginTop: 80, color: "#27ae60", fontSize: 24}}>
                Loading Enigma Machine...
            </div>
        );
    }

    // If configuration has been submitted, show the Enigma machine
    if(submittedConfig) {
        return <EnigmaMachine config={submittedConfig} user_id={user_id} config_id={submittedConfigId} onBackToConfig={handleBackToConfig}/>;
    }

    // Render the configuration page UI
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
                                            Rotors: {config.rotors && config.rotors.length === 3 ? config.rotors.map(r => r.spec).join('-') : '--'} | 
                                            Reflector: {config.reflector || ''} | 
                                            Plugboard: {config.plugboardPairs ? config.plugboardPairs.length : 0} pairs
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
                {/* Config form UI */}
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