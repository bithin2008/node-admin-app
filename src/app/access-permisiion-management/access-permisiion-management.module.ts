import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccessPermisiionManagementRoutingModule } from './access-permisiion-management-routing.module';
import { AccessPermissionComponent } from './access-permission/access-permission.component';
import { PrimeNgModule } from '../prime-ng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../@shared/shared.module";
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
    declarations: [
        AccessPermissionComponent
    ],
    imports: [
        CommonModule,
        AccessPermisiionManagementRoutingModule,
        PrimeNgModule,
        ReactiveFormsModule,
        SharedModule,
        TabsModule.forRoot(),

    ]
})
export class AccessPermisiionManagementModule { }
