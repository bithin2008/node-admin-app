import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepartmentManagementRoutingModule } from './department-management-routing.module';
import { DepartmentComponent } from './department/department.component';
import { SharedModule } from "../@shared/shared.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModule } from '../prime-ng.module';


@NgModule({
    declarations: [
        DepartmentComponent
    ],
    imports: [
        CommonModule,
        DepartmentManagementRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        PrimeNgModule
    ]
    
})
export class DepartmentManagementModule { }
