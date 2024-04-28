import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComissionMasterSettingsComponent } from './comission-master-settings/comission-master-settings.component';
import { ManageSalesCommissionComponent } from './manage-sales-commission/manage-sales-commission.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'comission-master-settings',
    pathMatch: 'full'
  },
  {path:'comission-master-settings',component:ComissionMasterSettingsComponent},
  {path:'manage-sales-commission',component:ManageSalesCommissionComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommissionManagementRoutingModule { }
