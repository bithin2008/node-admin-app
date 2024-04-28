import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleManagementRoutingModule } from './role-management-routing.module';
import { RoleComponent } from './role/role.component';
import { SharedModule } from "../@shared/shared.module";
import { PrimeNgModule } from '../prime-ng.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
    declarations: [
        RoleComponent
    ],
    imports: [
        CommonModule,
        RoleManagementRoutingModule,
        SharedModule,
        PrimeNgModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        FormsModule,
        TabsModule.forRoot(),

    ]
})
export class RoleManagementModule { }
