import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CareerManagementRoutingModule } from './career-management-routing.module';
import { CareerListComponent } from './career-list/career-list.component';
import { SharedModule } from "../@shared/shared.module";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PrimeNgModule } from '../prime-ng.module';

@NgModule({
  declarations: [
    CareerListComponent
  ],
  imports: [
    CommonModule,
    CareerManagementRoutingModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule,
    FormsModule,
    PrimeNgModule,
    SharedModule
  ]
})
export class CareerManagementModule { }
