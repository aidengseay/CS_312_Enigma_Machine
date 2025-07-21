import React, { useState } from "react";
import axios from "axios";

export default function AccountPage({ user, onLogout, onBack }) {
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
                <button onClick={onBack} className="main-btn main-btn-back">← Back</button>
                <h2 className="main-title">Account Settings</h2>
                <p><strong>Username:</strong> {user?.username}</p>
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
