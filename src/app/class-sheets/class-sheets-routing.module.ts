import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassSheetsComponent } from './class-sheets.component';
import { ClassSheetsInventoryComponent } from './inventories/class-sheet-inventories.component';
import { ClassSheetDistributionComponent } from './distribution/class-sheet-distribution.component';

const routes: Routes = [
  { path: '', component: ClassSheetsComponent }, 
  { path: 'inventories', component: ClassSheetsInventoryComponent },
  { path: 'distributions', component: ClassSheetDistributionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassSheetsRoutingModule { }
