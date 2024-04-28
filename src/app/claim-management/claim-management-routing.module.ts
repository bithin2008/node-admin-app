import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClaimComponent } from './claim/claim.component';
import { ClaimCreateComponent } from './claim-create/claim-create.component';
import { ClaimEditComponent } from './claim-edit/claim-edit.component';
import { ClaimThankYouComponent } from './claim-thank-you/claim-thank-you.component';

const routes: Routes = [
  {path:'',component:ClaimComponent},
  { path:'create-claim', component: ClaimCreateComponent },
  { path:'edit-claim/:claim_id', component: ClaimEditComponent },
  { path:'thank-you/:claim_id', component: ClaimThankYouComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimManagementRoutingModule { }
