import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetsRoutingModule } from './assets-routing.module';
import { AssetsComponent } from './assets.component';
import { AssetEntryComponent } from './asset-entry/asset-entry.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    AssetsComponent,
    AssetEntryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AssetsRoutingModule
  ]
})
export class AssetsModule { }
