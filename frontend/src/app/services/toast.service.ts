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
      if(toastNotification.type == ToastType.Error){
        toastNotification.title = "Error"
      }else if(toastNotification.type == ToastType.Success){
        toastNotification.title = "Success"
      }else{
        toastNotification.title = "Notification"
      }
    }

    if(toastNotification.type == ToastType.Error){
      toastNotification.displayClass += ' bg-danger text-light'
    } else if(toastNotification.type == ToastType.Success){
      toastNotification.displayClass += ' bg-indigo text-light'
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
