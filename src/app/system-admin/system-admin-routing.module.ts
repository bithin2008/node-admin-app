import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../system-admin/dashboard/dashboard.component';
import { SystemAdminModulesComponent } from './system-admin-modules/system-admin-modules.component';
import { SystemAdminSubModulesComponent } from './system-admin-sub-modules/system-admin-sub-modules.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationUsersComponent } from './organization-users/organization-users.component';
import { OrganizationUserRolesComponent } from './organization-user-roles/organization-user-roles.component';
import { OrganizationDepartmentsComponent } from './organization-departments/organization-departments.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'modules', component: SystemAdminModulesComponent },
  { path: 'sub-modules', component: SystemAdminSubModulesComponent },
  { path: 'organization', component: OrganizationsComponent },
  { path: 'organization-departments', component:OrganizationDepartmentsComponent },
  { path: 'organization-user-roles', component:OrganizationUserRolesComponent },
  { path: 'organization-users', component:OrganizationUsersComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemAdminRoutingModule { }
