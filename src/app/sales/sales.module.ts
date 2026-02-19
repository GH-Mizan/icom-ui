import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { SharedModule } from '@shared/shared.module';
import { SaleEntryComponent } from './sale-entry/sale-entry.component';
import { DueReceivedHistoryComponent } from './due-received-histories/due-received-histories.component';
import { DueReceivedEntryComponent } from './due-received-entry/due-received-entry.component';


@NgModule({
  declarations: [
    SalesComponent,
    SaleEntryComponent,
    DueReceivedHistoryComponent,
    DueReceivedEntryComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    SalesRoutingModule
  ]
})
export class SalesModule { }
