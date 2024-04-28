import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractorListComponent } from './contractor-list/contractor-list.component';
import { ContractorDetailsComponent } from './contractor-details/contractor-details.component';


const routes: Routes = [
  { path: '', component:ContractorListComponent },
  { path:'contractor-details/:contractor_id',component:ContractorDetailsComponent},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractorManagementRoutingModule { }
