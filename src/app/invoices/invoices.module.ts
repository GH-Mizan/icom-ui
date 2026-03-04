import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoicesRoutingModule } from './invoices-routing.module';
import { InvoicesComponent } from './invoices.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    InvoicesComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    InvoicesRoutingModule
  ]
})
export class InvoicesModule { }
