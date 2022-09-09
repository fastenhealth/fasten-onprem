import { NgModule } from '@angular/core';
import { ComponentsSidebarComponent } from './components-sidebar/components-sidebar.component';
import { RouterModule } from '@angular/router';
import { UtilitiesSidebarComponent } from './utilities-sidebar/utilities-sidebar.component';

@NgModule({
  imports: [
    RouterModule
  ],
  declarations: [
    ComponentsSidebarComponent,
    UtilitiesSidebarComponent
  ],
  exports: [
    ComponentsSidebarComponent,
    UtilitiesSidebarComponent
  ]
})

export class SharedModule { }