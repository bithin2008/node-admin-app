import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanManagementRoutingModule } from './plan-management-routing.module';
import { PlanManagementComponent } from './plan-management.component';
import { PrimeNgModule } from '../prime-ng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../@shared/shared.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import { PlanTermsComponent } from './plan-terms/plan-terms.component';
import { PlanTermDiscountComponent } from './plan-term-discount/plan-term-discount.component';

@NgModule({
  declarations: [
    PlanManagementComponent,
    PlanTermDiscountComponent,
    PlanTermsComponent
  ],
  imports: [
    CommonModule,
    PlanManagementRoutingModule,
    MultiSelectModule,
    PrimeNgModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
    BsDropdownModule.forRoot()
  ]
})
export class PlanManagementModule { }
