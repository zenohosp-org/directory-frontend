import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Redirects unauthenticated users to /login.
 * If `roles` is provided, also enforces role-based access.
 * Shows loading screen while session is being restored.
 */
export function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (roles && !roles.includes(user.role?.toLowerCase())) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

/**
 * Redirects authenticated users away from /login.
 * Shows loading screen while session is being restored.
 */
export function GuestRoute({ children }) {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (user) return <Navigate to="/dashboard" replace />;
    return children;
}
