import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllSalesManComponent } from './all-sales-man/all-sales-man.component';
import { SalesManDetailsComponent } from './sales-man-details/sales-man-details.component';

const routes: Routes = [

  {path:'',component:AllSalesManComponent},
  {path:'sales-man-details/:salesman_id',component:SalesManDetailsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesManagementRoutingModule { }
