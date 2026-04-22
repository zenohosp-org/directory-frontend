import axios from 'axios';

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ── Auth ──
export const login = (data) => api.post('/api/auth/login', data);
export const adminLogin = (data) => api.post('/api/auth/admin/login', data);
export const googleLogin = (data) => api.post('/api/auth/google', data);
export const getMe = () => api.get('/api/auth/me');
export const logout = () => api.post('/api/auth/logout');
const crossOriginLogout = (url) =>
    fetch(url, { method: 'POST', credentials: 'include', mode: 'no-cors' });

export const logoutFromAssets    = () => crossOriginLogout(`${import.meta.env.VITE_ASSET_API_URL}/api/auth/logout`);
export const logoutFromInventory = () => crossOriginLogout(`${import.meta.env.VITE_INVENTORY_API_URL}/api/auth/logout`);
export const logoutFromHms       = () => crossOriginLogout(`${import.meta.env.VITE_HMS_API_URL}/api/auth/logout`);
export const logoutFromFinance   = () => crossOriginLogout(`${import.meta.env.VITE_FINANCE_API_URL}/api/auth/logout`);

// ── Directory (public) ──
export const getHospitals = () => api.get('/api/directory/hospitals');
export const getHospitalByCode = (code) => api.get(`/api/directory/hospitals/${code}`);
export const getActiveModules = (id) => api.get(`/api/directory/hospitals/${id}/modules`);

// ── Super Admin ──
export const getAllHospitals = () => api.get('/api/superadmin/hospitals');
export const getHospitalById = (id) => api.get(`/api/superadmin/hospitals/${id}`);
export const createHospital = (data) => api.post('/api/superadmin/hospitals', data);
export const updateHospital = (id, data) => api.put(`/api/superadmin/hospitals/${id}`, data);
export const getAllModules = () => api.get('/api/directory/modules');
export const activateModule = (hospitalId, moduleId) =>
  api.post(`/api/superadmin/hospitals/${hospitalId}/modules/${moduleId}/activate`);
export const deactivateModule = (hospitalId, moduleId) =>
  api.post(`/api/superadmin/hospitals/${hospitalId}/modules/${moduleId}/deactivate`);
export const assignAdmin = (hospitalId, data) =>
  api.post(`/api/superadmin/hospitals/${hospitalId}/admin`, data);

export default api;
