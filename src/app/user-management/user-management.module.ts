import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserComponent } from './user/user.component';
import { SharedModule } from "../@shared/shared.module";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PrimeNgModule } from '../prime-ng.module';


@NgModule({
    declarations: [
        UserComponent,
    ],
    imports: [
        CommonModule,
        UserManagementRoutingModule,
        SharedModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        BsDatepickerModule,
        FormsModule,
        PrimeNgModule,
    ]
})
export class UserManagementModule { }
