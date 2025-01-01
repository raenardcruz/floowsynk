import { Group } from "@/components/Common/Interfaces"

const groups: Group[] = [
    {
        id: 1,
        icon: "handyman",
        name: "Utility",
        description: "Performs fundamental operations like math, string manipulations, date operations, variable management, text replacement, and regex operations.",
    },
    {
        id: 2,
        icon: "network_node",
        name: "Logic/Control Flow",
        description: "Manages workflow logic with conditions, loops, and delays.",
    },
    {
        id: 3,
        icon: "transform",
        name: "Data Transformation",
        description: "Transforms data formats and structures, including mapping, parsing, and aggregating data.",
    },
    {
        id: 4,
        icon: "cable",
        name: "Connectivity",
        description: "Connects to external systems and services, including messaging, APIs, and software connectors.",
    },
    {
        id: 5,
        icon: "security",
        name: "Security",
        description: "Handles authentication, encryption, and security-related operations.",
    },
    {
        id: 6,
        icon: "analytics",
        name: "Monitoring and Analytics",
        description: "Collects metrics, monitors performance, and generates reports and dashboards.",
    },
    {
        id: 7,
        icon: "output",
        name: "Output",
        description: "Output nodes are used for testing visualization. These nodes are not executed in deployed process.",
    }
]

export default groups;