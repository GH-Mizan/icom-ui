import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BtebSessionsRoutingModule } from './bteb-sessions-routing.module';
import { BtebSessionsComponent } from './bteb-sessions.component';
import { BtebSessionEntryComponent } from './bteb-session-entry/bteb-session-entry.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    BtebSessionsComponent,
    BtebSessionEntryComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    BtebSessionsRoutingModule
  ]
})
export class BtebSessionsModule { }
