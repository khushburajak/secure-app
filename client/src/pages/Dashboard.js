"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "./Dashboard.css"

const Dashboard = () => {
    const { user } = useAuth()

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome to your Dashboard</h1>
                <p>Hello, {user?.username}! Here's your secure dashboard.</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Profile Management</h3>
                    <p>Update your profile information and security settings</p>
                    <Link to="/profile" className="card-link">
                        Manage Profile
                    </Link>
                </div>

                <div className="dashboard-card">
                    <h3>Security Settings</h3>
                    <p>Set up multi-factor authentication for enhanced security</p>
                    <Link to="/mfa-setup" className="card-link">
                        Setup MFA
                    </Link>
                </div>

                {user?.role === "admin" && (
                    <div className="dashboard-card">
                        <h3>Activity Logs</h3>
                        <p>View system activity logs and user actions</p>
                        <Link to="/admin/logs" className="card-link">
                            View Logs
                        </Link>
                    </div>
                )}

                {user?.role === "user" && (
                    <div className="dashboard-card">
                        <h3>Transaction</h3>
                        <p>Create and view your secure transactions</p>
                        <Link to="/view-transaction" className="card-link">
                            View Transactions History
                        </Link>
                    </div>
                )}

                <div className="dashboard-card">
                    <h3>Account Status</h3>
                    <p>Your account is active and secure</p>
                    <div className="status-indicator">
                        <span className="status-dot active"></span>
                        Active
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
