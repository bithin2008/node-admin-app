import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CareerListComponent } from './career-list/career-list.component';


const routes: Routes = [
  { path: '', component:CareerListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CareerManagementRoutingModule { }
