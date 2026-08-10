export const getSelectedEnvironment = (): 'staging' | 'production' => {
    const env = localStorage.getItem('app_environment');
    return env === 'production' ? 'production' : 'staging';
}

export const getApiUrl = (): string => {
    const baseUrl = import.meta.env.VITE_SERVER || 'http://localhost:8082';
    const env = getSelectedEnvironment();
    if (env === 'staging') {
        return `${baseUrl.replace(/\/$/, '')}/staging`;
    }
    return baseUrl;
}

export const getRestUrl = (): string => {
    const restUrl = import.meta.env.VITE_REST_SERVER || 'http://localhost:8083';
    const env = getSelectedEnvironment();
    if (env === 'staging') {
        return `${restUrl.replace(/\/$/, '')}/staging`;
    }
    return restUrl;
}

export interface IdProps {
    id: string
    tooltip?: string
}