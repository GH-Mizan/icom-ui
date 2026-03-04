import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BtebSessionsComponent } from './bteb-sessions.component';

const routes: Routes = [{ path: '', component: BtebSessionsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BtebSessionsRoutingModule { }
