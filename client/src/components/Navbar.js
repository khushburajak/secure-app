"use client"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "./Navbar.css"

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    SecureApp
                </Link>

                <div className="navbar-menu">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="navbar-item">
                                Dashboard
                            </Link>
                            <Link to="/profile" className="navbar-item">
                                Profile
                            </Link>
                            {user?.role === "admin" && (
                                <Link to="/admin/logs" className="navbar-item">
                                    Activity Logs
                                </Link>
                            )}
                            <div className="navbar-user">
                                <span>Welcome, {user?.username}</span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-item">
                                Login
                            </Link>
                            <Link to="/register" className="navbar-item">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
