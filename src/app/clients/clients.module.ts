import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';
import { SharedModule } from '@shared/shared.module';
import { ClientEntryComponent } from './client-entry/client-entry.component';


@NgModule({
  declarations: [
    ClientsComponent,
    ClientEntryComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    ClientsRoutingModule
  ]
})
export class ClientsModule { }
