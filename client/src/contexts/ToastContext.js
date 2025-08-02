"use client"

import { createContext, useContext, useState } from "react"

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null)

    const showToast = (message, type = "info") => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 5000)
    }

    const hideToast = () => {
        setToast(null)
    }

    return <ToastContext.Provider value={{ toast, showToast, hideToast }}>{children}</ToastContext.Provider>
}

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}
