import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginFormComponent } from './login-form/login-form.component';
import { ForgotPasswordFormComponent } from './forgot-password-form/forgot-password-form.component';
import { ResetPasswordFormComponent } from './reset-password-form/reset-password-form.component';
import { AuthLayoutComponent } from './auth-layout.component';
import { ValidateOtpComponent } from './validate-otp/validate-otp.component';
import { UserActivationComponent } from './user-activation/user-activation.component';
import { SystemAdminLoginComponent } from './system-admin-login/system-admin-login.component';
import { ValidateSystemAdminOtpComponent } from './validate-system-admin-otp/validate-system-admin-otp.component';
import { SystemAdminForgotPasswordFormComponent } from './system-admin-forgot-password-form/system-admin-forgot-password-form.component';
import { SystemAdminResetPasswordComponent } from './system-admin-reset-password/system-admin-reset-password.component';
const routes: Routes = [
  {
    path: '',
    redirectTo:'login',
    pathMatch: 'full'
  },
  { path: 'login', component: LoginFormComponent },
  { path: 'system-admin-login', component: SystemAdminLoginComponent },
  { path: 'validate-system-admin-otp', component: ValidateSystemAdminOtpComponent },
  { path: 'validate-otp', component: ValidateOtpComponent },
  { path: 'forgot-password', component: ForgotPasswordFormComponent },
  { path: 'system-admin-forgot-password', component: SystemAdminForgotPasswordFormComponent },
  { path: 'system-admin-reset-password/:systemadmintoken', component: SystemAdminResetPasswordComponent },
  { path: 'reset-password/:fogotpasstoken', component: ResetPasswordFormComponent },
  { path: 'user-activation/:usertoken', component: UserActivationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
