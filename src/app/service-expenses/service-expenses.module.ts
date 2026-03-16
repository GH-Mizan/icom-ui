import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceExpensesRoutingModule } from './service-expenses-routing.module';
import { ServiceExpensesComponent } from './service-expenses.component';
import { ServiceExpenseEntryComponent } from './service-expense-entry/service-expense-entry.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    ServiceExpensesComponent,
    ServiceExpenseEntryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ServiceExpensesRoutingModule
  ]
})

export class ServiceExpensesModule { }
