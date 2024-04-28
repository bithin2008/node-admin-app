import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EscrowPaymentComponent } from './escrow-payment/escrow-payment.component';
import { PaymentHistoryComponent } from '../policy-management/payment-history/payment-history.component';

const routes: Routes = [
  { path: '', component:  PaymentHistoryComponent},
  { path: 'escrow-payment', component: EscrowPaymentComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentsManagementRoutingModule { }
