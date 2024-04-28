import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerManagementRoutingModule } from './customer-management-routing.module';
import { CustomersComponent } from './customers/customers.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../@shared/shared.module";
import { PrimeNgModule } from '../prime-ng.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CustomerReviewManagementComponent } from './customer-review-management/customer-review-management.component';
import { StarRatingModule } from 'angular-star-rating';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
    declarations: [
        CustomersComponent,
        CustomerDetailsComponent,
        CustomerReviewManagementComponent
    ],
    imports: [
        CommonModule,
        CustomerManagementRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        PrimeNgModule,
        BsDatepickerModule,
        BsDropdownModule.forRoot(),
        StarRatingModule.forRoot()
    ]
})
export class CustomerManagementModule { }
