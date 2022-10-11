import {Injectable} from '@angular/core';
import {ToastNotification, ToastType} from '../models/fasten/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts: ToastNotification[] = [];
  constructor() { }

  show(toastNotification: ToastNotification) {
    if(!toastNotification.title){
      toastNotification.title = toastNotification.type == ToastType.Error ? "Error" : "Notification"
    }

    if(toastNotification.type == ToastType.Error){
      toastNotification.displayClass += ' bg-danger text-light'
    }

    this.toasts.push(toastNotification);
  }

  remove(toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  clear() {
    this.toasts.splice(0, this.toasts.length);
  }
}
