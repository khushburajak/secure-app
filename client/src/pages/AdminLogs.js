"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../services/api"
import { useToast } from "../contexts/ToastContext"
import "./AdminLogs.css"

const AdminLogs = () => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("")
    const { showToast } = useToast()

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await adminAPI.getActivityLogs()
                setLogs(response.data)
            } catch (error) {
                showToast("Failed to fetch activity logs", "error")
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [showToast])

    const filteredLogs = logs.filter(
        (log) =>
            log.action?.toLowerCase().includes(filter.toLowerCase()) ||
            log.username?.toLowerCase().includes(filter.toLowerCase()) ||
            log.ip?.includes(filter),
    )

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading activity logs...</p>
            </div>
        )
    }

    return (
        <div className="admin-logs-container">
            <div className="logs-header">
                <h2>Activity Logs</h2>
                <div className="logs-filter">
                    <input
                        type="text"
                        placeholder="Filter logs..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-input"
                    />
                </div>
            </div>

            <div className="logs-table-container">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>IP Address</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map((log, index) => (
                            <tr key={index}>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                                <td>{log?.userId?.username || "Anonymous"}</td>
                                <td>
                                    <span className={`action-badge ${log.action?.toLowerCase()}`}>{log.action}</span>
                                </td>
                                <td>{log.ipAddress}</td>
                                <td>{log.details || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredLogs.length === 0 && (
                    <div className="no-logs">
                        <p>No activity logs found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminLogs
