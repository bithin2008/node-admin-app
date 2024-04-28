import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractorManagementRoutingModule } from './contractor-management-routing.module';
import { ContractorListComponent } from './contractor-list/contractor-list.component';
import { SharedModule } from '../@shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PrimeNgModule } from '../prime-ng.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ContractorDetailsComponent } from './contractor-details/contractor-details.component';

@NgModule({
  declarations: [
    ContractorListComponent,
    ContractorDetailsComponent
  ],
  imports: [
    CommonModule,
    ContractorManagementRoutingModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule,
    FormsModule,
    PrimeNgModule,
    SharedModule,
    AutoCompleteModule
  ]
})
export class ContractorManagementModule { }
