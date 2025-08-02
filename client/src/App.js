import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ToastProvider } from "./contexts/ToastContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import AdminLogs from "./pages/AdminLogs"
import MFASetup from "./pages/MFASetup"
import MFAVerify from "./pages/MFAVerify"
import ViewTransaction from "./pages/TransactionHistory"
import Toast from "./components/Toast"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/mfa-verify" element={<MFAVerify />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mfa-setup"
                  element={
                    <ProtectedRoute>
                      <MFASetup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={
                    <AdminRoute>
                      <AdminLogs />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/view-transaction"
                  element={
                    <ProtectedRoute>
                      <ViewTransaction />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Toast />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
