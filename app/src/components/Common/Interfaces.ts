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
    draggable?: boolean;
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
    group: number[];
    nodestyle?: string;
    inputs?: string[];
    outputs?: string[];
    draggable?: boolean;
    icon: {  name: string; color: string; };
    position: {
        x: number;
        y: number;
    };
    data: any;
}

export interface Group {
    id: number;
    name: string;
    description: string;
    icon: string;
}