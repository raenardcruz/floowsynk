import api from '@/utils/api';
import { LoginResponse } from '@/utils/types';

export const LoginRequest = async (session: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/extend-token', { token: session });
    return response.data;
}

export const LoginRequestUserPass = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/login', { username, password });
    return response.data;
}