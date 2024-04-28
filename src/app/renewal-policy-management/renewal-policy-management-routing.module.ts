import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateRenewalPolicyComponent } from './create-renewal-policy/create-renewal-policy.component';

const routes: Routes = [
  // { path: '', component: ProductComponent },
  { path: 'create-renewal-policy', component: CreateRenewalPolicyComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RenewalPolicyManagementRoutingModule { }
