import api from '@/utils/api';
import { WorkflowList } from '@/utils/types';

export const getAllWorkflows = async (limit: number, offset: number): Promise<WorkflowList> => {
    const response = await api.get<WorkflowList>(`/api/workflows?limit=${limit}&offset=${offset}`);
    return response.data;
}

export const listWorkflowRunHistory = async (): Promise<any> => {
    const response = await api.get('/api/workflow-history');
    return response.data;
}

export const getWorkflowHistory = async (id: string): Promise<any> => {
    const response = await api.get(`/api/workflow-history/${id}`);
    return response.data;
}