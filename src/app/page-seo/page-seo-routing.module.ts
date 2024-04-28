import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageSeoManagementComponent } from './page-seo-management/page-seo-management.component';

const routes: Routes = [
  {path:'',component:PageSeoManagementComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageSeoRoutingModule { }
