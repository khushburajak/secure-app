"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth()

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (user?.role !== "admin") {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default AdminRoute
