import api from '@/utils/api';

export const updateProcess = async (process: any) => {
    return api.put(`/api/workflows/${process.id}`, process);
}

export const createProcess = async (process: any) => {
    return api.post('/api/workflows', process);
}

export const deleteProcess = async (process: any) => {
    return api.delete(`/api/workflows/${process.id}`);
}