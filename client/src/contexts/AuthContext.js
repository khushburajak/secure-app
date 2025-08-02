"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext()

const initialState = {
    user: null,
    token: localStorage.getItem("accessToken"),
    isAuthenticated: false,
    loading: true,
    requiresMFA: false,
    mfaUserId: null,
    error: null,
}

const authReducer = (state, action) => {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, loading: action.payload }
        case "LOGIN_SUCCESS":
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                requiresMFA: false,
                mfaUserId: null,
                error: null,
            }
        case "LOGIN_MFA_REQUIRED":
            return {
                ...state,
                requiresMFA: true,
                mfaUserId: action.payload.userId,
                loading: false,
                error: null,
            }
        case "LOGOUT":
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                requiresMFA: false,
                mfaUserId: null,
                error: null,
            }
        case "UPDATE_USER":
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            }
        case "SET_ERROR":
            return {
                ...state,
                error: action.payload,
                loading: false,
            }
        default:
            return state
    }
}

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState)

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("accessToken")
            if (token) {
                try {
                    const response = await authAPI.getProfile()
                    dispatch({
                        type: "LOGIN_SUCCESS",
                        payload: { user: response.data, token },
                    })
                } catch (error) {
                    localStorage.removeItem("accessToken")
                    dispatch({ type: "LOGOUT" })
                }
            } else {
                dispatch({ type: "SET_LOADING", payload: false })
            }
        }

        initAuth()
    }, [])

    const login = async (credentials) => {
        dispatch({ type: "SET_LOADING", payload: true })
        try {
            const response = await authAPI.login(credentials)

            if (response.data.requiresMFA) {
                dispatch({
                    type: "LOGIN_MFA_REQUIRED",
                    payload: { userId: response.data.userId },
                })

                localStorage.setItem("mfaUserId", response.data.userId)
                return { requiresMFA: true }
            }

            localStorage.setItem("accessToken", response.data.accessToken)
            const userResponse = await authAPI.getProfile()

            dispatch({
                type: "LOGIN_SUCCESS",
                payload: {
                    user: userResponse.data,
                    token: response.data.accessToken,
                },
            })

            return { success: true }
        } catch (error) {
            let errorMessage = "Login failed"
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = "Invalid credentials"
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message
                }
            }
            dispatch({ type: "SET_ERROR", payload: errorMessage })
            throw error
        }
    }

    const verifyMFA = async (token) => {
        dispatch({ type: "SET_LOADING", payload: true })
        try {
            const mfaUserId = state.mfaUserId || localStorage.getItem("mfaUserId")

            const response = await authAPI.verifyMFA({
                userId: mfaUserId,
                token,
            })

            localStorage.setItem("accessToken", response.data.accessToken)
            const userResponse = await authAPI.getProfile()

            dispatch({
                type: "LOGIN_SUCCESS",
                payload: {
                    userId: userResponse.data,
                    token: response.data.accessToken,
                },
            })

            return { success: true }
        } catch (error) {
            let errorMessage = "MFA verification failed"
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            }
            dispatch({ type: "SET_ERROR", payload: errorMessage })
            return { success: false, error: errorMessage }
        } finally {
            dispatch({ type: "SET_LOADING", payload: false })
        }
    }

    const logout = () => {
        localStorage.removeItem("accessToken")
        dispatch({ type: "LOGOUT" })
    }

    const updateUser = (userData) => {
        dispatch({ type: "UPDATE_USER", payload: userData })
    }

    const value = {
        ...state,
        login,
        logout,
        verifyMFA,
        updateUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}