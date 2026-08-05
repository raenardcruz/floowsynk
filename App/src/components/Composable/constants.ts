export const getApiUrl = (): string => {
    const apiUrl = import.meta.env.VITE_SERVER;
    if (!apiUrl) {
        throw new Error("VITE_SERVER is not defined");
    }
    return apiUrl;
}

export const getRestUrl = (): string => {
    const restUrl = import.meta.env.VITE_REST_SERVER;
    if (restUrl) return restUrl;
    // Fallback: derive from gRPC server URL by replacing port
    const apiUrl = import.meta.env.VITE_SERVER || 'http://localhost:8082';
    return apiUrl.replace(/:\d+$/, ':8083');
}

export interface IdProps {
    id: string
    tooltip?: string
}