
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

export const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
});

apiClient.interceptors.request.use(
    (config) => {
        const { token } = useAuthStore.getState();
        if (token) {
            config.headers.Authorization = `${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
