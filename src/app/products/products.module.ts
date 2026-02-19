import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { SharedModule } from '@shared/shared.module';
import { ProductEntryComponent } from './product-entry/product-entry.component';


@NgModule({
  declarations: [
    ProductsComponent,
    ProductEntryComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    ProductsRoutingModule
  ]
})

export class ProductsModule { }
