import dashboard from "@/components/Icons/dashboard.svg";
import workflow from "@/components/Icons/workflow.svg";
import connection from "@/components/Icons/connection.svg";
import approve from "@/components/Icons/approve.svg";
import user from "@/components/Icons/user.svg";
import logs from "@/components/Icons/logs.svg";
import settings from "@/components/Icons/settings.svg";

export const apps = [
    {
        "name": "Dashboard",
        "icon": dashboard,
        "path": "/"
    },
    {
        "name": "Workflow",
        "icon": workflow,
        "path": "/workflow"
    },
    {
        "name": "Connectors",
        "icon": connection,
        "path": "/connectors"
    },
    {
        "name": "Reviews",
        "icon": approve,
        "path": "/reviews"
    },
    {
        "name": "Accounts",
        "icon": user,
        "path": "/accounts"
    },
    {
        "name": "Logs",
        "icon": logs,
        "path": "/logs"
    },
    {
        "name": "Settings",
        "icon": settings,
        "path": "/settings"
    }
]