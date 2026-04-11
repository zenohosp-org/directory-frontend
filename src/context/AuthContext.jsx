import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin, adminLogin as apiAdminLogin, getMe, logout as apiLogout, logoutFromAssets, logoutFromInventory } from '../api/client';

const AuthContext = createContext(null);
const LOGOUT_FLAG_KEY = 'sso_logout_flag';
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

    useEffect(() => {
    // FIXED: Only block restoration if the logout happened on THIS origin.
    // Don't use the flag to permanently block SSO cookie-based restoration.
    const justLoggedOut = localStorage.getItem(LOGOUT_FLAG_KEY);

    if (justLoggedOut) {
        // Clear it immediately — it should only block once, not forever
        localStorage.removeItem(LOGOUT_FLAG_KEY);
        setLoading(false);
        return;
    }

    if (!user) {
        // Always call getMe() if no user in sessionStorage — cookie may be valid via SSO
        getMe()
            .then(res => {
                const userData = res.data.data || res.data;
                sessionStorage.setItem('zeno_user', JSON.stringify(userData));
                setUser(userData);
            })
            .catch(() => {
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

    // Listen for cross-app logout signals (from other tabs/windows)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'sso-logout') {
                sessionStorage.removeItem('zeno_user');
                setUser(null);
                window.location.href = '/login?logged_out=1';
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

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
        localStorage.removeItem(LOGOUT_FLAG_KEY);
        return userData;
    }, []);

    const doLogout = useCallback(async () => {
    // REMOVED: localStorage.setItem(LOGOUT_FLAG_KEY, '1');
    // The flag caused SSO sessions to be silently blocked.
    // Cross-app logout is handled by the sso-logout storage event below.
    sessionStorage.removeItem('zeno_user');
    setUser(null);

    try {
        localStorage.setItem('sso-logout', `${Date.now()}`);
        window.dispatchEvent(new Event('sso-logout'));
    } catch (e) {}

    try {
        await Promise.all([
            apiLogout(),
            logoutFromAssets(),
            logoutFromInventory()
        ]);
    } catch (e) {}

    window.location.href = '/login?logged_out=1';
}, []);

    const isSuperAdmin = user?.role?.toLowerCase() === 'super_admin';
    const isHospitalAdmin = user?.role?.toLowerCase() === 'hospital_admin';
    const isDoctor = user?.role?.toLowerCase() === 'doctor';
    const isStaff = user?.role?.toLowerCase() === 'staff';

    return (
        <AuthContext.Provider value={{ user, loading, isSuperAdmin, isHospitalAdmin, isDoctor, isStaff, doLogin, doLogout, logout: doLogout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
