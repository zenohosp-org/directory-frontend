import axios from 'axios';

const normalizeApiBaseUrl = (rawUrl) => {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return 'https://api-directory.zenohosp.com';

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === 'directory.zenohosp.com') {
      parsed.hostname = 'api-directory.zenohosp.com';
      const normalized = parsed.toString().replace(/\/$/, '');
      return normalized.replace(/\/api$/, '');
    }
    return trimmed.replace(/\/$/, '').replace(/\/api$/, '');
  } catch {
    return 'https://api-directory.zenohosp.com';
  }
};

const envApiBaseUrl = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_BACKEND_URL;
const defaultApiBaseUrl =
  typeof window !== 'undefined' && window.location.hostname === 'directory.zenohosp.com'
    ? 'https://api-directory.zenohosp.com'
    : 'https://api-directory.zenohosp.com';

export const API_BASE_URL = normalizeApiBaseUrl(envApiBaseUrl || defaultApiBaseUrl);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Log API configuration for debugging
if (typeof window !== 'undefined') {
  window.__ZENOHOSP_API_BASE__ = API_BASE_URL;
  console.log('[ZenoHosp] API Base URL:', API_BASE_URL);
}

// Intercept errors to handle JSON parse failures gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || 'unknown';
      console.error(`[ZenoHosp] ${status} ${url}`, {
        statusText: error.response.statusText,
        contentType: error.response.headers['content-type'],
        body: typeof error.response.data === 'string' ? error.response.data.slice(0, 200) : error.response.data,
      });
    }
    return Promise.reject(error);
  }
);

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
