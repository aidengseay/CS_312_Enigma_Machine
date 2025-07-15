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
        <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, background: "#222", borderRadius: 12, color: "#fff" }}>
            <button onClick={onBack} style={{ marginBottom: 16, background: "#3498db", color: "#fff", border: "none", borderRadius: 4, padding: "6px 14px", cursor: "pointer" }}>
                ← Back
            </button>
            <h2 style={{ color: "#f39c12" }}>Account Settings</h2>
            <p><strong>Username:</strong> {user?.username}</p>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} style={{ marginTop: 32, marginBottom: 32 }}>
                <h3 style={{ color: "#27ae60" }}>Change Password</h3>
                <div style={{ marginBottom: 10 }}>
                    <label>Current Password:<br/>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required style={{ width: "100%", padding: 6, borderRadius: 4, border: "1px solid #555" }} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>New Password:<br/>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} style={{ width: "100%", padding: 6, borderRadius: 4, border: "1px solid #555" }} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Confirm New Password:<br/>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} style={{ width: "100%", padding: 6, borderRadius: 4, border: passwordsMatch || !confirmPassword ? "1px solid #555" : "1px solid #e74c3c" }} />
                    </label>
                    {!passwordsMatch && confirmPassword && (
                        <div style={{ color: "#e74c3c", marginTop: 4 }}>Passwords do not match.</div>
                    )}
                </div>
                <button type="submit" disabled={changing} style={{ background: "#27ae60", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", cursor: changing ? "not-allowed" : "pointer" }}>
                    {changing ? "Changing..." : "Change Password"}
                </button>
                {changeStatus && <div style={{ marginTop: 10, color: changeStatus.includes("success") ? "#27ae60" : "#e74c3c" }}>{changeStatus}</div>}
            </form>

            {/* Delete Account Form */}
            <form onSubmit={handleDeleteAccount}>
                <h3 style={{ color: "#e74c3c" }}>Delete Account</h3>
                <div style={{ marginBottom: 10 }}>
                    <label>Confirm Password:<br/>
                        <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} required style={{ width: "100%", padding: 6, borderRadius: 4, border: "1px solid #555" }} />
                    </label>
                </div>
                <button type="submit" disabled={deleting} style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", cursor: deleting ? "not-allowed" : "pointer" }}>
                    {deleting ? "Deleting..." : "Delete Account"}
                </button>
                {deleteStatus && <div style={{ marginTop: 10, color: deleteStatus.includes("success") || deleteStatus.includes("deleted") ? "#27ae60" : "#e74c3c" }}>{deleteStatus}</div>}
            </form>

            <button onClick={onLogout} style={{ marginTop: 32, background: "#888", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", cursor: "pointer" }}>
                Logout
            </button>
        </div>
    );
}
