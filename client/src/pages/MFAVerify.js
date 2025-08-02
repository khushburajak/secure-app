"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import "./Auth.css"

const MFAVerify = () => {
    const [token, setToken] = useState("")
    const [loading, setLoading] = useState(false)

    const { verifyMFA } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()

    React.useEffect(() => {
        const mfaUserId = localStorage.getItem("mfaUserId")
        if (!mfaUserId) {
            navigate("/login")
        }
    }, [navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const mfaUserId = localStorage.getItem("mfaUserId")
            if (!mfaUserId) {
                showToast("Session expired. Please login again.", "error")
                navigate("/login")
                return
            }

            const result = await verifyMFA(token)

            if (result.success) {
                showToast("MFA verification successful!", "success")
                navigate("/dashboard")
            } else {
                showToast(result.error || "MFA verification failed", "error")
            }
        } catch (error) {
            showToast(error.response?.data?.message || "An unexpected error occurred", "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Multi-Factor Authentication</h2>
                <p>Please enter the 6-digit code from your authenticator app</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="token">Authentication Code</label>
                        <input
                            type="text"
                            id="token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="000000"
                            maxLength="6"
                            pattern="[0-9]{6}"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default MFAVerify