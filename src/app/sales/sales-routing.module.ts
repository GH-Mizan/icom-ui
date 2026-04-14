import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './sales.component';
import { SalesDetailsComponent } from './details/sales-details.component';

const routes: Routes = [{ path: '', component: SalesComponent }, { path: 'details', component: SalesDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
