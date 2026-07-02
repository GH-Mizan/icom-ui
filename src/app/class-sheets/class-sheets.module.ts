import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassSheetsRoutingModule } from './class-sheets-routing.module';
import { ClassSheetsComponent } from './class-sheets.component';
import { ClassSheetsInventoryComponent } from './inventories/class-sheet-inventories.component';
import { ClassSheetDistributionComponent } from './distribution/class-sheet-distribution.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    ClassSheetsComponent,
    ClassSheetsInventoryComponent,
    ClassSheetDistributionComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    ClassSheetsRoutingModule
  ]
})
export class ClassSheetsModule { }
