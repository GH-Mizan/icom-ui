import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent } from './services.component';
import { SharedModule } from '@shared/shared.module';
import { ServiceEntryComponent } from './service-entry/service-entry.component';
import { ServiceDueReceivedEntryComponent } from './due-received-entry/due-received-entry.component';
import { ServiceDueReceivedHistoryComponent } from './due-received-histories/due-received-histories.component';


@NgModule({
  declarations: [
    ServicesComponent,
    ServiceEntryComponent,
    ServiceDueReceivedEntryComponent,
    ServiceDueReceivedHistoryComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    ServicesRoutingModule
  ]
})

export class ServicesModule { }
