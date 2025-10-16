import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { HotelProvider } from './contexts/HotelContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <AuthProvider>
      <HotelProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="hotels" element={<div>Hotels Page</div>} />
            <Route path="rooms" element={<div>Rooms Page</div>} />
            <Route path="customers" element={<div>Customers Page</div>} />
            <Route path="bookings" element={<div>Bookings Page</div>} />
            <Route path="payments" element={<div>Payments Page</div>} />
            <Route path="reports" element={<div>Reports Page</div>} />
            <Route path="settings" element={<div>Settings Page</div>} />
          </Route>
        </Routes>
      </HotelProvider>
    </AuthProvider>
  )
}

export default App





