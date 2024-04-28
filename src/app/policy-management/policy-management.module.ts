import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PolicyManagementRoutingModule } from './policy-management-routing.module';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { SharedModule } from "../@shared/shared.module";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PrimeNgModule } from '../prime-ng.module';
import { FailedPaymentComponent } from './failed-payment/failed-payment.component';
import { PolicyListComponent } from './policy-list/policy-list.component';
import { PolicyCreateComponent } from './policy-create/policy-create.component';
import { PolicyEditComponent } from './policy-edit/policy-edit.component';
import { PolicyThankYouComponent } from './policy-thank-you/policy-thank-you.component';
import { RenewPolicyComponent } from './renew-policy/renew-policy.component';
import { PolicyRenewalsComponent } from './policy-renewals/policy-renewals.component';

@NgModule({
  declarations: [
    PaymentHistoryComponent,
    FailedPaymentComponent,
    PolicyListComponent,
    PolicyCreateComponent,
    PolicyEditComponent,
    RenewPolicyComponent,
    PolicyRenewalsComponent,
    PolicyThankYouComponent
  ],
  imports: [
    CommonModule,
    PolicyManagementRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule,
    FormsModule,
    PrimeNgModule,
  ]
})
export class PolicyManagementModule { }
