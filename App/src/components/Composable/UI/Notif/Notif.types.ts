export type NotifOptions = {
    teleportTarget?: string
    message: string
    duration?: number
    type?: "success" | "error" | "info"
  }