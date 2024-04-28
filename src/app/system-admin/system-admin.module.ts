import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SystemAdminRoutingModule } from './system-admin-routing.module';
import { SystemAdminModulesComponent } from './system-admin-modules/system-admin-modules.component';
import { SystemAdminSubModulesComponent } from './system-admin-sub-modules/system-admin-sub-modules.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../@shared/shared.module';
import { ConfirmationDialogService } from '../@core/services/confirmation-dialog.service';
import { PrimeNgModule } from '../prime-ng.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationUsersComponent } from './organization-users/organization-users.component';
import { OrganizationUserRolesComponent } from './organization-user-roles/organization-user-roles.component';
import { OrganizationDepartmentsComponent } from './organization-departments/organization-departments.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [
    DashboardComponent,
    SystemAdminModulesComponent,
    SystemAdminSubModulesComponent,
    OrganizationsComponent,
    OrganizationUsersComponent,
    OrganizationUserRolesComponent,
    OrganizationDepartmentsComponent
  ],
  imports: [
    CommonModule,
    SystemAdminRoutingModule,
    PrimeNgModule,
    SharedModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxDatatableModule,
    BsDatepickerModule,
    FormsModule
  ],
  providers:[ConfirmationDialogService]
})
export class SystemAdminModule { }
