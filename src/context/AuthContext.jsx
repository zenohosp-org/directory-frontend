import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin, adminLogin as apiAdminLogin, getMe, logout as apiLogout } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = sessionStorage.getItem('zeno_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(!user); // if user exists, don't need to load

    // Restore session from backend on mount (cookie-based auth)
    useEffect(() => {
        if (!user && loading) {
            getMe()
                .then(res => {
                    const userData = res.data.data || res.data;
                    sessionStorage.setItem('zeno_user', JSON.stringify(userData));
                    setUser(userData);
                })
                .catch(() => {
                    // No valid session/cookie
                    sessionStorage.removeItem('zeno_user');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // When the window/tab regains focus, verify session with backend.
    // This detects logouts performed in other apps (cross-subdomain) where
    // the server-side cookie may have been cleared.
    useEffect(() => {
        const verifyOnFocus = async () => {
            if (!user) return;
            try {
                await getMe();
                // still valid — nothing to do
            } catch (err) {
                // Session invalidated on server; clear local state and redirect to login
                sessionStorage.removeItem('zeno_user');
                setUser(null);
                window.location.href = '/login?logged_out=1';
            }
        };

        window.addEventListener('focus', verifyOnFocus);
        return () => window.removeEventListener('focus', verifyOnFocus);
    }, [user]);

    const doLogin = useCallback(async (email, password) => {
        // Try regular hospital login first; if that fails try super admin login
        let res;
        try {
            res = await apiLogin({ email, password });
        } catch (err) {
            const status = err?.response?.status;
            if (status !== 401 && status !== 403) {
                throw err;
            }
            // If regular login fails, try the super-admin endpoint
            res = await apiAdminLogin({ email, password });
        }
        const userData = res.data.data;
        sessionStorage.setItem('zeno_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    }, []);

    const doLogout = useCallback(async () => {
        await apiLogout().catch(() => null);
        sessionStorage.removeItem('zeno_user');
        setUser(null);
    }, []);

    const isSuperAdmin = user?.role?.toLowerCase() === 'super_admin';
    const isHospitalAdmin = user?.role?.toLowerCase() === 'hospital_admin';
    const isDoctor = user?.role?.toLowerCase() === 'doctor';
    const isStaff = user?.role?.toLowerCase() === 'staff';

    return (
        <AuthContext.Provider value={{ user, loading, isSuperAdmin, isHospitalAdmin, isDoctor, isStaff, doLogin, doLogout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
