"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import { authAPI } from "../services/api"
import "./Profile.css"

const Profile = () => {
    const { user, updateUser } = useAuth()
    const { showToast } = useToast()

    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await authAPI.updateProfile(formData)
            updateUser(formData)
            showToast("Profile updated successfully!", "success")
        } catch (error) {
            const message =
                typeof error.response?.data === "string"
                    ? error.response.data
                    : error.response?.data?.message || "Login failed";
            showToast(message, "error");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Profile Settings</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <button type="submit" disabled={loading} className="profile-btn">
                        {loading ? "Updating..." : "Update Profile"}
                    </button>
                </form>

                <div className="profile-info">
                    <h3>Account Information</h3>
                    <p>
                        <strong>Role:</strong> {user?.role || "User"}
                    </p>
                    <p>
                        <strong>MFA Status:</strong> {user?.mfaEnabled ? "Enabled" : "Disabled"}
                    </p>
                    <p>
                        <strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Profile
