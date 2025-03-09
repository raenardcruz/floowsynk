import axios from 'axios';
import { Process } from '@/views/Workflow'

const getAPIData = (process: Process) => {
    let workflowPayload: any = {
        nodes: process.nodes,
        edges: process.edges
    }
    let payload: any = {
        ...workflowPayload,
        type: process.type,
        name: process.title,
        description: process.description
    };
    let headers = {
        headers: {
            'Authorization': `${localStorage.getItem('sessionToken')}`,
            'Content-Type': 'application/json'
        }
    }

    return {
        workflowPayload,
        payload,
        headers
    }
}

export const updateProcess = async (process: Process) => {
    const { payload, headers } = getAPIData(process);
    return axios.put(`/api/workflow/${process.id}`, payload, headers);
}

export const createProcess = async (process: Process) => {
    const { payload, headers } = getAPIData(process);
    payload.id = process.id;
    return axios.post(`/api/workflow`, payload, headers);
}

export const deleteProcess = async (process: Process) => {
    const { headers } = getAPIData(process);
    return axios.delete(`/api/workflow/${process.id}`, headers);
}

export const executeProcess = async (process: Process) => {
    const { workflowPayload, headers } = getAPIData(process);
    return axios.post(`/api/workflow/${process.id}/run`, workflowPayload, headers);
}