import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const method  = err.config?.method?.toUpperCase() ?? 'REQ';
    const url     = err.config?.url ?? 'unknown';
    const status  = err.response?.status ?? 'NO_RESPONSE';
    const message = err.response?.data?.message ?? err.message;

    console.error(
      `❌ [API] ${method} ${url} → ${status}:`,
      message,
      err.response?.data ?? '',
    );

    if (err.response?.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
