"use client"
import { useToast } from "../contexts/ToastContext"
import "./Toast.css"

const Toast = () => {
    const { toast, hideToast } = useToast()

    if (!toast) return null

    return (
        <div className={`toast toast-${toast.type}`}>
            <div className="toast-content">
                <span>{toast.message}</span>
                <button onClick={hideToast} className="toast-close">
                    ×
                </button>
            </div>
        </div>
    )
}

export default Toast
