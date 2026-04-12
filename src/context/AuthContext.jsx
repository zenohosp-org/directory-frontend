import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin, adminLogin as apiAdminLogin, getMe, logout as apiLogout, logoutFromAssets, logoutFromInventory } from '../api/client';

const AuthContext = createContext(null);
const LOGOUT_FLAG_KEY = 'sso_logout_flag';

export function AuthProvider({ children }) {
    // Always start null + loading=true.
    // Cookie is the source of truth — sessionStorage is only a write-cache.
    // Initializing from sessionStorage caused ghost sessions when cookie was gone.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: always verify with backend via HttpOnly cookie.
    useEffect(() => {
        const justLoggedOut = localStorage.getItem(LOGOUT_FLAG_KEY);
        if (justLoggedOut) {
            localStorage.removeItem(LOGOUT_FLAG_KEY);
            sessionStorage.removeItem('zeno_user');
            setUser(null);
            setLoading(false);
            return;
        }

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
    }, []);

    // Re-verify on tab focus — detects cross-app logouts
    useEffect(() => {
        const verifyOnFocus = async () => {
            if (!user) return;
            try {
                await getMe();
            } catch {
                sessionStorage.removeItem('zeno_user');
                setUser(null);
                window.location.href = '/login?logged_out=1';
            }
        };

        window.addEventListener('focus', verifyOnFocus);
        return () => window.removeEventListener('focus', verifyOnFocus);
    }, [user]);

    // Cross-tab logout signal
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
        let res;
        try {
            res = await apiLogin({ email, password });
        } catch (err) {
            const status = err?.response?.status;
            if (status !== 401 && status !== 403) throw err;
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
            await Promise.all([
                apiLogout(),
                logoutFromAssets(),
                logoutFromInventory()
            ]);
        } catch (e) {}

        window.location.href = '/login?logged_out=1';
    }, []);

    const isSuperAdmin   = user?.role?.toLowerCase() === 'super_admin';
    const isHospitalAdmin = user?.role?.toLowerCase() === 'hospital_admin';
    const isDoctor       = user?.role?.toLowerCase() === 'doctor';
    const isStaff        = user?.role?.toLowerCase() === 'staff';

    return (
        <AuthContext.Provider value={{
            user, loading,
            isSuperAdmin, isHospitalAdmin, isDoctor, isStaff,
            doLogin, doLogout, logout: doLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);