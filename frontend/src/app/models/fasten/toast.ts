export enum ToastType {
  Error = "error",
  Info = "info"
}

export class ToastNotification {
  title?: string
  message: string
  type: ToastType = ToastType.Info
  displayClass: string = 'demo-static-toast'
}
