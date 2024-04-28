import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './customers/customers.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { CustomerReviewManagementComponent } from './customer-review-management/customer-review-management.component';

const routes: Routes = [
  {path:'',component:CustomersComponent},
  {path:'customer-details/:customer_id',component:CustomerDetailsComponent},
  {path:'customer-review-management',component:CustomerReviewManagementComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerManagementRoutingModule { }
