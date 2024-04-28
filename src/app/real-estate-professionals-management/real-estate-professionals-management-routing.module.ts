import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RealEstateProfessionalsListComponent } from './real-estate-professionals-list/real-estate-professionals-list.component';
import { RealEstateProfessionalDetailsComponent } from './real-estate-professional-details/real-estate-professional-details.component';

const routes: Routes = [
  { path: '', component:RealEstateProfessionalsListComponent },
  { path: 'realtor-details/:realtor_id', component:RealEstateProfessionalDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RealEstateProfessionalsManagementRoutingModule { }
