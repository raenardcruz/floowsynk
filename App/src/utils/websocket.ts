import { getApiUrl } from '@/components/Composable/constants';
import { ReplayData } from './types';

export type OnMessageCallback = (data: ReplayData) => void;
export type OnErrorCallback = (error: Event) => void;
export type OnCloseCallback = () => void;

export class WorkflowWebSocket {
    private socket: WebSocket | null = null;
    private url: string;

    constructor(workflowId: string) {
        const baseUrl = getApiUrl().replace(/^http/, 'ws');
        this.url = `${baseUrl}/api/ws/workflow/run?workflow_id=${workflowId}&token=${localStorage.getItem('sessionToken')}`;
    }

    connect(onMessage: OnMessageCallback, onError?: OnErrorCallback, onClose?: OnCloseCallback, initialPayload?: any) {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            if (initialPayload) {
                this.send(initialPayload);
            }
        };

        this.socket.onmessage = (event) => {
            try {
                const data: ReplayData = JSON.parse(event.data);
                onMessage(data);
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
            }
        };

        if (onError) {
            this.socket.onerror = onError;
        }

        if (onClose) {
            this.socket.onclose = onClose;
        }
    }

    send(data: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn("WebSocket is not open. Cannot send message.");
        }
    }

    close() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}
