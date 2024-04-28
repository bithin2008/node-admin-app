import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterSettingsRoutingModule } from './master-settings-routing.module';
import { WhitelistIpComponent } from './whitelist-ip/whitelist-ip.component';
import { PrimeNgModule } from '../prime-ng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../@shared/shared.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { ManageReferFriendComponent } from './manage-refer-friend/manage-refer-friend.component';
import { ManageZipCodeComponent } from './manage-zip-code/manage-zip-code.component';
import { ProductBrandsComponent } from './product-brands/product-brands.component';
import { ServiceCallFeeComponent } from './service-call-fee/service-call-fee.component';
import { ClaimsPriorityComponent } from './claims-priority/claims-priority.component';
import { HoldingPeriodsComponent } from './holding-periods/holding-periods.component';
import { PropertyTypesComponent } from './property-types/property-types.component';
import { TermsMasterComponent } from './terms-master/terms-master.component';
import { PolicyStatusComponent } from './policy-status/policy-status.component';
import { PaymentStatusComponent } from './payment-status/payment-status.component';
import { PropertySizeComponent } from './property-size/property-size.component';
import { ClaimStatusComponent } from './claim-status/claim-status.component';
import { RenewalStatusComponent } from './renewal-status/renewal-status.component';
import { NgxColorsModule } from 'ngx-colors';

@NgModule({
  declarations: [
    WhitelistIpComponent,
    ManageReferFriendComponent,
    ManageZipCodeComponent,
    ProductBrandsComponent,
    ServiceCallFeeComponent,
    ClaimsPriorityComponent,
    HoldingPeriodsComponent,
    PropertyTypesComponent,
    TermsMasterComponent,
    PolicyStatusComponent,
    PaymentStatusComponent,
    PropertySizeComponent,
    ClaimStatusComponent,
    RenewalStatusComponent
  ],
  imports: [
    CommonModule,
    MasterSettingsRoutingModule,
    AutocompleteLibModule,
    MultiSelectModule,
    PrimeNgModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
    NgxColorsModule,
    BsDropdownModule.forRoot()
  ]
})
export class MasterSettingsModule { }
