// src/shared/api/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://neura-brhac2ghgvdtbggn.francecentral-01.azurewebsites.net',    
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stale token if server says unauthorized
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                delete axios.defaults.headers.common['Authorization'];
            }
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;