import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketLeaderManagementComponent } from './market-leader-management.component';


const routes: Routes = [
  {path:'',component:MarketLeaderManagementComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketLeaderManagementRoutingModule { }
