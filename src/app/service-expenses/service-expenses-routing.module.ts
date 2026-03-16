import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceExpensesComponent } from './service-expenses.component';

const routes: Routes = [{ path: '', component: ServiceExpensesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceExpensesRoutingModule { }
