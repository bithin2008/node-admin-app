import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { FailedPaymentComponent } from './failed-payment/failed-payment.component';
import { PolicyListComponent } from './policy-list/policy-list.component';
import { PolicyCreateComponent } from './policy-create/policy-create.component';
import { PolicyEditComponent } from './policy-edit/policy-edit.component';
import { PolicyThankYouComponent } from './policy-thank-you/policy-thank-you.component';
import { RenewPolicyComponent } from './renew-policy/renew-policy.component';
import { PolicyRenewalsComponent } from './policy-renewals/policy-renewals.component';


const routes: Routes = [
  { path: '', component: PolicyListComponent },
  { path: 'create-policy', component: PolicyCreateComponent },
  { path: 'policy-renewals', component: PolicyRenewalsComponent },
  { path: 'payment-history', component: PaymentHistoryComponent },
  { path: 'failed-payment', component: FailedPaymentComponent },
   { path: 'edit-policy/:policy_id',  component: PolicyEditComponent },
   { path: 'thank-you', component: PolicyThankYouComponent },
   { path: 'renew-policy/:policy_id',  component: RenewPolicyComponent }
];


@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class PolicyManagementRoutingModule { }
