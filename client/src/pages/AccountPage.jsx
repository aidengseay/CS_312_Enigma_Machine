import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AccountPage({ user, onLogout, onBack }) {
    
    //state for saved messages
    const [savedMessages, setSavedMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messagesError, setMessagesError] = useState("");
    const [deletingMessageId, setDeletingMessageId] = useState(null);
    
    // State for saved configs management
    // Array of user's saved configurations
    const [savedConfigs, setSavedConfigs] = useState([]);
    // Loading state for fetching configs
    const [loadingConfigs, setLoadingConfigs] = useState(false);
    // Error message for config operations
    const [configsError, setConfigsError] = useState("");
    // ID of config being deleted (for UI feedback)
    const [deletingConfigId, setDeletingConfigId] = useState(null);
    
    // State for change password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changeStatus, setChangeStatus] = useState("");
    const [changing, setChanging] = useState(false);

    // State for delete account
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteStatus, setDeleteStatus] = useState("");
    const [deleting, setDeleting] = useState(false);

    //Fetch messages
    useEffect(() => {
    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/messages?user_id=${user.user_id}`);
            setSavedMessages(res.data.messages || []);
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            setLoadingMessages(false);
        }
    };
        fetchMessages();
    }, [user.user_id]);
    
    // Fetch saved configs when user_id changes
    useEffect(() => {
        if (!user.user_id) return;
        fetchSavedConfigs();
    }, [user.user_id]);

    const fetchSavedConfigs = async () => {
        setLoadingConfigs(true);
        setConfigsError("");
        try {
            const response = await axios.get(`/configs?user_id=${user.user_id}`);
            setSavedConfigs(response.data.configs || []);
        } catch (err) {
            setConfigsError("Failed to load saved configurations.");
        } finally {
            setLoadingConfigs(false);
        }
    };
    
    //delete message handeler
    const handleDeleteMessage = async (message_id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        setDeletingMessageId(message_id);
        try {
            await axios.delete(`/messages/${message_id}`);
            setSavedMessages((msgs) => msgs.filter((msg) => msg.message_id !== message_id));
        } catch (err) {
            alert("Failed to delete message.");
        } finally {
            setDeletingMessageId(null);
        }
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

    // Change password handler
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setChangeStatus("");
        if (newPassword !== confirmPassword) {
            setChangeStatus("New passwords do not match.");
            return;
        }
        setChanging(true);
        try {
            const res = await axios.post("/change-password", {
                user_id: user.user_id,
                current_password: currentPassword,
                new_password: newPassword
            });
            setChangeStatus(res.data.message || "Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setChangeStatus(err.response?.data?.error || "Error changing password.");
        } finally {
            setChanging(false);
        }
    };

    // Delete account handler
    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
        setDeleteStatus("");
        setDeleting(true);
        try {
            const res = await axios.post("/delete-account", {
                user_id: user.user_id,
                password: deletePassword
            });
            setDeleteStatus(res.data.message || "Account deleted.");
            setTimeout(() => {
                onLogout();
            }, 1200);
        } catch (err) {
            setDeleteStatus(err.response?.data?.error || "Error deleting account.");
        } finally {
            setDeleting(false);
        }
    };

    const passwordsMatch = newPassword === confirmPassword;

    return (
        <div className="page-center">
            <div className="main-panel">
                <h2 className="main-title">Account Settings</h2>
                <p><strong>Username:</strong> {user?.username}</p>
                
                {/* Display user's saved messages */}
                <div className="main-form">
                    <h3 className="main-section-title">Saved Messages</h3>
                    {loadingMessages ? (
                      <div>Loading...</div>
                    ) : messagesError ? (
                        <div style={{ color: "#e74c3c" }}>{messagesError}</div>
                    ) : savedMessages.length === 0 ? (
                        <div style={{ color: "#888" }}>No saved messages yet.</div>
                    ) : (
                      <ul style={{ maxHeight: 200, overflowY: "auto", padding: 0, listStyle: "none" }}>
                                {savedMessages.map(msg => (
                                    <li key={msg.message_id} style={{ background: "#222", color: "#fff", marginBottom: 8, padding: 10, borderRadius: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: 14, color: "#aaa" }}>Config ID: {msg.config_id}</div>
                                            <div style={{ fontSize: 16 }}>{msg.message_text}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteMessage(msg.message_id)}

                                            style={{
                                                marginLeft: 16,
                                                background: "#e74c3c",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 4,
                                                padding: "6px 14px",
                                                cursor: deletingMessageId === msg.message_id ? "not-allowed" : "pointer",
                                                fontSize: 14
                                            }}
                                        >
                                            {deletingMessageId === msg.message_id ? "Deleting..." : "Delete"}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                    )}
                </div>

                {/* Saved Configurations Section - Display user's saved configs */}
                <div className="main-form">
                    <h3 className="main-section-title">Saved Configurations</h3>
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

                {/* change password */}
                <form className="main-form" onSubmit={handleChangePassword}>
                    <h3 className="main-section-title">Change Password</h3>
                    <div className="main-form-group">
                        <label className="main-label">Current Password:<br/>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="main-input" />
                        </label>
                    </div>
                    <div className="main-form-group">
                        <label className="main-label">New Password:<br/>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="main-input" />
                        </label>
                    </div>
                    <div className="main-form-group">
                        <label className="main-label">Confirm New Password:<br/>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="main-input" style={{ border: passwordsMatch || !confirmPassword ? undefined : "1px solid #e74c3c" }} />
                        </label>
                        {!passwordsMatch && confirmPassword && (
                            <div className="main-error">Passwords do not match.</div>
                        )}
                    </div>
                    <button type="submit" disabled={changing} className="main-btn main-btn-save">{changing ? "Changing..." : "Change Password"}</button>
                    {changeStatus && <div className="main-error" style={{ color: changeStatus.includes("success") ? "#27ae60" : undefined }}>{changeStatus}</div>}
                </form>
                <form className="main-form" onSubmit={handleDeleteAccount}>
                    <h3 className="main-section-title" style={{ color: "#e74c3c" }}>Delete Account</h3>
                    <div className="main-form-group">
                        <label className="main-label">Confirm Password:<br/>
                            <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} required className="main-input" />
                        </label>
                    </div>
                    <button type="submit" disabled={deleting} className="main-btn main-btn-delete">{deleting ? "Deleting..." : "Delete Account"}</button>
                    {deleteStatus && <div className="main-error" style={{ color: deleteStatus.includes("success") || deleteStatus.includes("deleted") ? "#27ae60" : undefined }}>{deleteStatus}</div>}
                </form>
                <button onClick={onLogout} className="main-btn main-btn-logout">Logout</button>
            </div>
        </div>
    );
}
