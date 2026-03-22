import axios from 'axios';

const normalizeApiBaseUrl = (rawUrl) => {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return 'https://api-directory.zenohosp.com';

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === 'directory.zenohosp.com') {
      parsed.hostname = 'api-directory.zenohosp.com';
      return parsed.toString().replace(/\/$/, '');
    }
    return trimmed.replace(/\/$/, '');
  } catch {
    return 'https://api-directory.zenohosp.com';
  }
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL || "https://api-directory-zenohosp.com",
  withCredentials: true,
});

// ── Auth ──
export const login = (data) => api.post('/api/auth/login', data);
export const adminLogin = (data) => api.post('/api/auth/admin/login', data);
export const googleLogin = (data) => api.post('/api/auth/google', data);
export const logout = () => api.post('/api/auth/logout');

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
