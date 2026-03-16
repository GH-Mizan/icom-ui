import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SetupExpensesComponent } from './setup-expenses.component';

const routes: Routes = [{ path: '', component: SetupExpensesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupExpensesRoutingModule { }
