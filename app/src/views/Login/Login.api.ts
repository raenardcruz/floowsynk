import { LoginServicePromiseClient } from 'proto/floowsynk_grpc_web_pb'
import { Credential, Token } from 'proto/floowsynk_pb'
import { getApiUrl } from '@/components/Composable/constants'

export const LoginRequest = async (session: any): Promise<Token> => {
    const client = new LoginServicePromiseClient(getApiUrl());
    const request = new Token();
    request.setToken(session);
    return await client.extendToken(request, {});
}

export const LoginRequestUserPass = async (username: string, password: string): Promise<Token> => {
    const client = new LoginServicePromiseClient(getApiUrl());
    const request = new Credential();
    request.setUsername(username);
    request.setPassword(password);
    return await client.login(request, {
        'authorization': `${localStorage.getItem('token')}`
    });
}