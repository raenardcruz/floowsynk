import axios from 'axios';
import { getApiUrl } from '@/components/Composable/constants';

const api = axios.create({
    baseURL: getApiUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add authorization header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle errors
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('sessionToken');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;
