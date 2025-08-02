"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { authAPI } from "../services/api"
import { useToast } from "../contexts/ToastContext"
import "./MFASetup.css"

const MFASetup = () => {
    const [qrCode, setQrCode] = useState("")
    const [secret, setSecret] = useState("")
    const [loading, setLoading] = useState(true)
    const { showToast } = useToast()

    useEffect(() => {
        const setupMFA = async () => {
            try {
                const response = await authAPI.setupMFA()
                setQrCode(response.data.qrCode)
                setSecret(response.data.secret)
            } catch (error) {
                showToast("Failed to setup MFA", "error")
            } finally {
                setLoading(false)
            }
        }

        setupMFA()
    }, [showToast])

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Setting up MFA...</p>
            </div>
        )
    }

    return (
        <div className="mfa-setup-container">
            <div className="mfa-setup-card">
                <h2>Setup Multi-Factor Authentication</h2>

                <div className="mfa-instructions">
                    <h3>Instructions:</h3>
                    <ol>
                        <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                        <li>Scan the QR code below with your authenticator app</li>
                        <li>Or manually enter the secret key</li>
                        <li>Your MFA will be active after scanning</li>
                    </ol>
                </div>

                {qrCode && (
                    <div className="qr-code-container">
                        <h3>QR Code:</h3>
                        <QRCodeSVG value={qrCode} size={200} />
                    </div>
                )}

                {secret && (
                    <div className="secret-container">
                        <h3>Manual Entry Key:</h3>
                        <code className="secret-key">{secret}</code>
                    </div>
                )}

                <div className="mfa-success">
                    <p>✅ MFA has been set up successfully!</p>
                    <p>You will be prompted for an authentication code on your next login.</p>
                </div>
            </div>
        </div>
    )
}

export default MFASetup
