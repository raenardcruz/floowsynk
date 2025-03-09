import axios from "axios";

export const LoginRequest = async (session: any): Promise<any> => {
    let url = '/api/login';
    let headers = {
        Authorization: `${session.value}`
    };
    return await axios.post(url, {}, { headers });
}

export const LoginRequestUserPass = async (username: string, password: string): Promise<any> => {
    let url = '/api/login';
    return await axios.post(url, { username, password });
}