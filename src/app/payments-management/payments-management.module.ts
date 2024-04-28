import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentsManagementRoutingModule } from './payments-management-routing.module';
import { EscrowPaymentComponent } from './escrow-payment/escrow-payment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from "../@shared/shared.module";
import { PrimeNgModule } from '../prime-ng.module';


@NgModule({
    declarations: [
        EscrowPaymentComponent
    ],
    imports: [
        CommonModule,
        PaymentsManagementRoutingModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        SharedModule,
        PrimeNgModule,
    ]
})
export class PaymentsManagementModule { }
