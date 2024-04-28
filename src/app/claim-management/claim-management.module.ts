import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClaimManagementRoutingModule } from './claim-management-routing.module';
import { ClaimComponent } from './claim/claim.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../@shared/shared.module";
import { ClaimCreateComponent } from './claim-create/claim-create.component';
import { ClaimEditComponent } from './claim-edit/claim-edit.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PrimeNgModule } from '../prime-ng.module';
import { ClaimThankYouComponent } from './claim-thank-you/claim-thank-you.component';


@NgModule({
    declarations: [
        ClaimComponent,
        ClaimCreateComponent,
        ClaimEditComponent,
        ClaimThankYouComponent
    ],
    imports: [
        CommonModule,
        ClaimManagementRoutingModule,
        BsDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        PrimeNgModule,
    ]
})
export class ClaimManagementModule { }
