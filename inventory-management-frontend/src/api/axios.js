import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    
    // Handle Token Refresh
    if (err.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          params: { refreshToken },
        });
        
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);
        
        original.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(original);
      } catch (refreshErr) {
        localStorage.clear();
        // Only redirect if NOT on login page already to avoid loops
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }
    
    // CRITICAL: Propagate error to component
    return Promise.reject(err);
  }
);

export default axiosInstance;