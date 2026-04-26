// src/shared/api/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://neura.runasp.net/',    
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

// axiosInstance.interceptors.response.use(
//     (response) => {
//         console.log(` [${response.config.method?.toUpperCase()}] ${response.config.url}`, response.data);
//         return response;
//     },
//     (error) => {
//         console.error(
//             ` [${error.config?.method?.toUpperCase()}] ${error.config?.url}`,
//             error.response?.status,
//             error.response?.data
//         );
//         return Promise.reject(error);
//     }
// );

export default axiosInstance;