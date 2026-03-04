import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrandsRoutingModule } from './brands-routing.module';
import { BrandsComponent } from './brands.component';
import { SharedModule } from '@shared/shared.module';
import { BrandEntryComponent } from './brand-entry/brand-entry.component';


@NgModule({
  declarations: [
    BrandsComponent,
    BrandEntryComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    BrandsRoutingModule
  ]
})
export class BrandsModule { }
