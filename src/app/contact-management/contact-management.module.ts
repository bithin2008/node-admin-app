import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactManagementRoutingModule } from './contact-management-routing.module';
import { ContactListComponent } from './contact-list/contact-list.component';
import { SharedModule } from "../@shared/shared.module";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PrimeNgModule } from '../prime-ng.module';

@NgModule({
  declarations: [
    ContactListComponent
  ],
  imports: [
    CommonModule,
    ContactManagementRoutingModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule,
    FormsModule,
    PrimeNgModule,
    SharedModule
  ]
})
export class ContactManagementModule { }
