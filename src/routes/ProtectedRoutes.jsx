// src/routes/ProtectedRoutes.jsx
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const isAuthenticated = true;

    return isAuthenticated ? children : <Navigate to="/login" />;
}