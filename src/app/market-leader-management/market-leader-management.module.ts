import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketLeaderManagementRoutingModule } from './market-leader-management-routing.module';
import { MarketLeaderManagementComponent } from './market-leader-management.component';
import { SharedModule } from '../@shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModule } from '../prime-ng.module';


@NgModule({
  declarations: [
    MarketLeaderManagementComponent
  ],
  imports: [
    CommonModule,
    MarketLeaderManagementRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    PrimeNgModule,
  ]
})
export class MarketLeaderManagementModule { }
