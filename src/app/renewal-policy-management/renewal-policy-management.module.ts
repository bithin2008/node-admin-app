import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RenewalPolicyManagementRoutingModule } from './renewal-policy-management-routing.module';
import { CreateRenewalPolicyComponent } from './create-renewal-policy/create-renewal-policy.component';


@NgModule({
  declarations: [
    CreateRenewalPolicyComponent
  ],
  imports: [
    CommonModule,
    RenewalPolicyManagementRoutingModule
  ]
})
export class RenewalPolicyManagementModule { }
