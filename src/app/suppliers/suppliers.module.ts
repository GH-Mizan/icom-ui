import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuppliersRoutingModule } from './suppliers-routing.module';
import { SuppliersComponent } from './suppliers.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    SuppliersComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    SuppliersRoutingModule
  ]
})
export class SuppliersModule { }
