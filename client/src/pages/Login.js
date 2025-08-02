"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import "./Auth.css"

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()
    const { showToast } = useToast()

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard")
        }
    }, [isAuthenticated, navigate])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleLogin = async () => {
        if (loading) return

        setLoading(true)
        try {
            const result = await login(formData)
            if (result?.requiresMFA) {
                navigate("/mfa-verify")
                showToast("Please enter your MFA code", "info")
            }
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
                <h2>Login</h2>
                <form>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
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
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleLogin}
                        disabled={loading}
                        className="auth-btn"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    )
}

export default Login