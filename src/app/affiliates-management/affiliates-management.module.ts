import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AffiliatesManagementRoutingModule } from './affiliates-management-routing.module';
import { AffiliatesListComponent } from './affiliates-list/affiliates-list.component';
import { SharedModule } from "../@shared/shared.module";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PrimeNgModule } from '../prime-ng.module';

@NgModule({
  declarations: [
    AffiliatesListComponent
  ],
  imports: [
    CommonModule,
    AffiliatesManagementRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule,
    FormsModule,
    PrimeNgModule,
  ]
})
export class AffiliatesManagementModule { }
