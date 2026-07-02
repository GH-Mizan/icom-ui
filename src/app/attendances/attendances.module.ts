import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttendancesRoutingModule } from './attendances-routing.module';
import { AttendancesComponent } from './attendances.component';
import { AttendanceEntryComponent } from './attendance-entry/attendance-entry.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    AttendancesComponent,
    AttendanceEntryComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    AttendancesRoutingModule
  ]
})
export class AttendanesModule { }
