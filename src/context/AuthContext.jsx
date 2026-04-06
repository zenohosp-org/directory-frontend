import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin, adminLogin as apiAdminLogin, getMe, logout as apiLogout } from '../api/client';

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
    if (localStorage.getItem(LOGOUT_FLAG_KEY)) {
        // just logged out — don't restore
        setLoading(false);
        return;
    }
    if (!user && loading) {
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
        localStorage.setItem(LOGOUT_FLAG_KEY, '1');
        sessionStorage.removeItem('zeno_user');
        setUser(null);

        try {
            localStorage.setItem('sso-logout', `${Date.now()}`);
            window.dispatchEvent(new Event('sso-logout'));
        } catch (e) {}

        try {
            await apiLogout(); // WAIT — cookie must be cleared before redirect
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
