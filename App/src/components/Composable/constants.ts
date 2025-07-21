export const getApiUrl = (): string => {
    const apiUrl = import.meta.env.VITE_SERVER;
    if (!apiUrl) {
        throw new Error("VITE_SERVER is not defined");
    }
    return apiUrl;
}

export interface IdProps {
    id: string
    tooltip?: string
}