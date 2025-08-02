import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("accessToken")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    },
)

export const authAPI = {
    register: (userData) => api.post("/api/auth/register", userData),
    login: (credentials) => api.post("/api/auth/login", credentials),
    setupMFA: () => api.post("/api/auth/setup-mfa"),
    verifyMFA: (data) => api.post("/api/auth/verify-mfa", data),
    getProfile: () => api.get("/api/users/profile"),
    updateProfile: (userData) => api.put("/api/users/profile", userData),
    createTransaction: (userData) => api.post("/api/transactions", userData),
    viewTransaction: (userData) => api.get("/api/transactions/history", userData),
}

export const adminAPI = {
    getActivityLogs: () => api.get("/api/activity-logs"),
}

export default api
