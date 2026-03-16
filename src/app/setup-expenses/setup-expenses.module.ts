import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupExpensesRoutingModule } from './setup-expenses-routing.module';
import { SetupExpensesComponent } from './setup-expenses.component';
import { SetupExpenseEntryComponent } from './setup-expense-entry/setup-expense-entry.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    SetupExpensesComponent,
    SetupExpenseEntryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SetupExpensesRoutingModule
  ]
})

export class SetupExpensesModule { }
