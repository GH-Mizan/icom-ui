import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoriesRoutingModule } from './inventories-routing.module';
import { InventoriesComponent } from './inventories.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    InventoriesComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    InventoriesRoutingModule
  ]
})
export class InventoriesModule { }
