import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesComponent } from './categories.component';
import { SharedModule } from '@shared/shared.module';
import { CategoryEntryComponent } from './category-entry/category-entry.component';

@NgModule({
  declarations: [
    CategoriesComponent,
    CategoryEntryComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    CategoriesRoutingModule
  ]
})
export class CategoriesModule { }
