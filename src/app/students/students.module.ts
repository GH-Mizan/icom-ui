import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentsRoutingModule } from './students-routing.module';
import { StudentsComponent } from './students.component';
import { SharedModule } from '@shared/shared.module';
import { StudentEntryComponent } from './student-entry/student-entry.component';


@NgModule({
  declarations: [
    StudentsComponent,
    StudentEntryComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    StudentsRoutingModule
  ]
})
export class StudentsModule { }
