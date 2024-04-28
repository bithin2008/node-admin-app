import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WhitelistIpComponent } from './whitelist-ip/whitelist-ip.component';
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


const routes: Routes = [
  { path: 'manage-whitelist-ip', component:WhitelistIpComponent },
  { path: 'manage-refer-friend', component:ManageReferFriendComponent },
  { path: 'manage-zip-code', component:ManageZipCodeComponent },
  { path: 'product-brands', component:ProductBrandsComponent },
  { path: 'scf', component:ServiceCallFeeComponent },
  { path: 'claims-priority', component:ClaimsPriorityComponent },
  { path: 'holding-periods', component:HoldingPeriodsComponent },
  { path: 'property-types', component:PropertyTypesComponent },
  { path: 'terms-master', component:TermsMasterComponent },
  { path: 'policy-status', component:PolicyStatusComponent },
  { path: 'payment-status', component:PaymentStatusComponent },
  { path: 'property-size', component:PropertySizeComponent },
  { path: 'claim-status', component:ClaimStatusComponent },
  { path: 'renewal-status', component:RenewalStatusComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterSettingsRoutingModule { }
