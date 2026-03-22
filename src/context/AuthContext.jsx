import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, adminLogin as apiAdminLogin, logout as apiLogout } from '../api/client';

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

    const doLogin = useCallback(async (email, password) => {
        console.log('Auth.doLogin:start', { email });
        // Try regular hospital login first; if that fails try super admin login
        let res;
        try {
            res = await apiLogin({ email, password });
        } catch (err) {
            // If regular login fails, try the super-admin endpoint
            res = await apiAdminLogin({ email, password });
        }
        console.log('Auth.doLogin:response', res?.data);
        const userData = res.data.data;
        const { token, ...userWithoutToken } = userData || {};
        sessionStorage.setItem('zeno_user', JSON.stringify(userWithoutToken));
        setUser(userWithoutToken);
        console.log('Auth.doLogin:success', { userId: userWithoutToken?.userId });
        return userWithoutToken;
    }, []);

    const doLogout = useCallback(async () => {
        console.log('Auth.doLogout:start');
        try { await apiLogout(); console.log('Auth.doLogout:apiLogout:ok'); } catch (e) { console.log('Auth.doLogout:apiLogout:error', e); }
        sessionStorage.removeItem('zeno_user');
        setUser(null);
        console.log('Auth.doLogout:done');
    }, []);

    const isSuperAdmin = user?.role?.toLowerCase() === 'super_admin';
    const isHospitalAdmin = user?.role?.toLowerCase() === 'hospital_admin';
    const isDoctor = user?.role?.toLowerCase() === 'doctor';
    const isStaff = user?.role?.toLowerCase() === 'staff';

    return (
        <AuthContext.Provider value={{ user, isSuperAdmin, isHospitalAdmin, isDoctor, isStaff, doLogin, doLogout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
