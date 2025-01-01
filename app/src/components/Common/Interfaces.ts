export interface Process {
    id: string;
    title: string;
    description: string;
    type: string;
    tags: string[];
    logging?: any[];
    showLogModal?: boolean;
    nodes?: Node[];
    edges?: any[];
    runMode?: boolean;
}

export interface Alert {
    message: string;
    visible: boolean;
    status: string;
}

export interface Node {
    id: string;
    type: string;
    label: string;
    position: {
        x: number;
        y: number;
    };
    data: any;
}