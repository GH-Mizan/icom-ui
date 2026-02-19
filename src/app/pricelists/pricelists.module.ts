import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PricelistsRoutingModule } from './pricelists-routing.module';
import { PricelistsComponent } from './pricelists.component';
import { SharedModule } from '@shared/shared.module';
import { PricelistEntryComponent } from './pricelist-entry/pricelist-entry.component';


@NgModule({
  declarations: [
    PricelistsComponent,
    PricelistEntryComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    PricelistsRoutingModule
  ]
})
export class PricelistsModule { }
