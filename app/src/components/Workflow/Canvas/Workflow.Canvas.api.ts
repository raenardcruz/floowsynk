import axios from 'axios';
import { Workflow } from 'proto/floowsynk_pb';

const getHeaders = () => {
    let headers = {
        headers: {
            'Authorization': `${localStorage.getItem('sessionToken')}`,
            'Content-Type': 'application/json'
        }
    }

    return headers
}

export const updateProcess = async (process: Workflow.AsObject) => {
    const headers = getHeaders();
    return axios.put(`/api/workflow/${process.id}`, process, headers);
}

export const createProcess = async (process: Workflow.AsObject) => {
    const headers = getHeaders();
    return axios.post(`/api/workflow`, process, headers);
}

export const deleteProcess = async (process: Workflow.AsObject) => {
    const headers = getHeaders();
    return axios.delete(`/api/workflow/${process.id}`, headers);
}

export const executeProcess = async (process: Workflow.AsObject) => {
    const headers = getHeaders();
    return axios.post(`/api/workflow/${process.id}/run`, process, headers);
}