import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanManagementComponent } from './plan-management.component';
import { PlanTermsComponent } from './plan-terms/plan-terms.component';
import { PlanTermDiscountComponent } from './plan-term-discount/plan-term-discount.component';

const routes: Routes = [
  { path: '', component: PlanManagementComponent },
   { path: 'plan-term',  component: PlanTermsComponent },
   { path: 'plan-term-discount',  component: PlanTermDiscountComponent },
  // { path: 'edit-plan/:plan_id',  component: AddEditPlanComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanManagementRoutingModule { }
