import { NgModule } from '@angular/core';

import { ToastComponent } from './toast/toast.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {MomentModule} from 'ngx-moment';

@NgModule({
  imports: [
    NgbModule,
    MomentModule,
  ],
  declarations: [
    LoadingSpinnerComponent,
    ToastComponent,
  ],
  exports: [
    LoadingSpinnerComponent,
    ToastComponent,
  ]
})

export class StatusModule { }
