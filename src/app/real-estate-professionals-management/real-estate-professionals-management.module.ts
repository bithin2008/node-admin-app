import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealEstateProfessionalsManagementRoutingModule } from './real-estate-professionals-management-routing.module';
import { RealEstateProfessionalsListComponent } from './real-estate-professionals-list/real-estate-professionals-list.component';
import { SharedModule } from "../@shared/shared.module";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PrimeNgModule } from '../prime-ng.module';
import { RealEstateProfessionalDetailsComponent } from './real-estate-professional-details/real-estate-professional-details.component';

@NgModule({
  declarations: [
    RealEstateProfessionalsListComponent,
    RealEstateProfessionalDetailsComponent
  ],
  imports: [
    CommonModule,
    RealEstateProfessionalsManagementRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule,
    FormsModule,
    PrimeNgModule,
  ]
})
export class RealEstateProfessionalsManagementModule { }
