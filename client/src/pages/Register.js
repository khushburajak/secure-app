"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authAPI } from "../services/api"
import { useToast } from "../contexts/ToastContext"
import "./Auth.css"

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [loading, setLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState({})

    const { showToast } = useToast()
    const navigate = useNavigate()

    const checkPasswordStrength = (password) => {
        let strength = 0
        const feedback = []

        // Check length (minimum 8 characters)
        if (password.length >= 8) {
            strength++
        } else {
            feedback.push("at least 8 characters")
        }

        // Check for lowercase letters
        if (/[a-z]/.test(password)) {
            strength++
        } else {
            feedback.push("lowercase letters")
        }

        // Check for uppercase letters
        if (/[A-Z]/.test(password)) {
            strength++
        } else {
            feedback.push("uppercase letters")
        }

        // Check for numbers
        if (/[0-9]/.test(password)) {
            strength++
        } else {
            feedback.push("numbers")
        }

        // Check for special characters
        if (/[^A-Za-z0-9]/.test(password)) {
            strength++
        } else {
            feedback.push("special characters")
        }

        // Additional checks for stronger passwords
        if (password.length >= 12) {
            strength += 0.5 // Bonus for longer passwords
        }

        if (password.length >= 16) {
            strength += 0.5 // Additional bonus for very long passwords
        }

        // Avoid common patterns
        if (!/(.)\1{2,}/.test(password)) {
            // No repeated characters (3+ times)
            strength += 0.5
        }

        if (!/123|abc|qwe|password|admin/i.test(password)) {
            // No common sequences
            strength += 0.5
        }

        // Determine strength level
        let level, color
        if (strength < 2) {
            level = "Very Weak"
            color = "very-weak"
        } else if (strength < 3) {
            level = "Weak"
            color = "weak"
        } else if (strength < 4) {
            level = "Fair"
            color = "fair"
        } else if (strength < 5) {
            level = "Good"
            color = "good"
        } else {
            level = "Strong"
            color = "strong"
        }

        return {
            level,
            color,
            score: Math.min(strength, 5), // Cap at 5 for percentage calculation
            feedback: feedback.length > 0 ? `Missing: ${feedback.join(", ")}` : "Strong password!",
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })

        if (name === "password") {
            const strength = checkPasswordStrength(value)
            setPasswordStrength(strength)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            showToast("Passwords do not match", "error")
            return
        }

        setLoading(true)

        try {
            await authAPI.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            })

            showToast("Registration successful! Please login.", "success")
            navigate("/login")
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
        <div className="auth-container">
            <div className="auth-card">
                <h2>Register</h2>
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

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {formData.password && (
                            <div className={`password-strength ${passwordStrength.color}`}>
                                <div className="strength-bar">
                                    <div className="strength-fill" style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                                </div>
                                <p>
                                    <strong>{passwordStrength.level}:</strong> {passwordStrength.feedback}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    )
}

export default Register
