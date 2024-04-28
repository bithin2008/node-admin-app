import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessPermissionComponent } from './access-permission/access-permission.component';

const routes: Routes = [
  {path:'',component:AccessPermissionComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessPermisiionManagementRoutingModule { }
