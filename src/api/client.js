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

export const API_BASE_URL = 'https://api-directory.zenohosp.com';

const api = axios.create({
  baseURL: 'https://api-directory.zenohosp.com',
  withCredentials: true,
});

// Debug: log outgoing requests and responses to trace login flow
api.interceptors.request.use((config) => {
  console.log('API.request', { method: config.method, url: config.url, data: config.data });
  return config;
}, (err) => {
  console.log('API.request.error', err);
  return Promise.reject(err);
});

api.interceptors.response.use((res) => {
  console.log('API.response', { url: res.config?.url, status: res.status, data: res.data });
  return res;
}, (err) => {
  console.log('API.response.error', err?.response?.status, err?.response?.data || err.message);
  return Promise.reject(err);
});

// ── Auth ──
export const login = async (data) => {
  console.log('Auth.login.request', data);
  try {
    const res = await api.post('/api/auth/login', data);
    console.log('Auth.login.response', { url: res.config?.url, status: res.status, data: res.data });
    return res;
  } catch (err) {
    console.log('Auth.login.error', err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
};

export const adminLogin = async (data) => {
  console.log('Auth.adminLogin.request', data);
  try {
    const res = await api.post('/api/auth/admin/login', data);
    console.log('Auth.adminLogin.response', { url: res.config?.url, status: res.status, data: res.data });
    return res;
  } catch (err) {
    console.log('Auth.adminLogin.error', err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
};

export const googleLogin = async (data) => {
  console.log('Auth.googleLogin.request', data);
  try {
    const res = await api.post('/api/auth/google', data);
    console.log('Auth.googleLogin.response', { url: res.config?.url, status: res.status, data: res.data });
    return res;
  } catch (err) {
    console.log('Auth.googleLogin.error', err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
};

export const logout = async () => {
  console.log('Auth.logout.request');
  try {
    const res = await api.post('/api/auth/logout');
    console.log('Auth.logout.response', { url: res.config?.url, status: res.status, data: res.data });
    return res;
  } catch (err) {
    console.log('Auth.logout.error', err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
};

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
