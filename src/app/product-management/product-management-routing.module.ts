import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';
import { ProductProblemsComponent } from './product-problems/product-problems.component';


const routes: Routes = [
  { path: '', component: ProductComponent },
  { path: 'product-issue-type', component: ProductProblemsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductManagementRoutingModule { }
