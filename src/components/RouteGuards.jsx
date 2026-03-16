import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Redirects unauthenticated users to /login.
 * If `roles` is provided, also enforces role-based access.
 */
export function ProtectedRoute({ children, roles }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (roles && !roles.includes(user.role?.toLowerCase())) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

/**
 * Redirects authenticated users away from /login.
 */
export function GuestRoute({ children }) {
    const { user, isSuperAdmin } = useAuth();
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
}
