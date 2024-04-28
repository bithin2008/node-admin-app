import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './@core/guards/auth.guard';
import { SystemAdminAuthGuard } from './@core/guards/system-admin-auth.guard';
import { DefaultLayoutComponent } from './@shared/components/layouts/default-layout/default-layout.component';
import { UnauthenticatedLayoutComponent } from './@shared/components/layouts/unauthenticated-layout/unauthenticated-layout.component';
import { AuthenticatedLayoutComponent } from './@shared/components/layouts/authenticated-layout/authenticated-layout.component';
import { ErrorPageNotFoundComponent } from './error-page-not-found/error-page-not-found.component';
import { ErrorUnauthorizedComponent } from './error-unauthorized/error-unauthorized.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { ElementsComponent } from './elements/elements.component';
import { SystemAuthenticatedLayoutComponent } from './@shared/components/layouts/system-authenticated-layout/system-authenticated-layout.component';
import { AuthLayoutComponent } from './auth/auth-layout.component';
import { RoleGuard } from './@core/guards/role.guard';
import { CheckPermissionGuard } from './@core/guards/check-permission.guard';
const isVisibleSplah = localStorage.getItem('splash')
// Routing with lazy loading
const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
      }
    ]
  },
  {
    path: 'splash',
    loadChildren: () => import('./splash-screen/splash-screen.module').then(m => m.SplashScreenModule)
  },

  {
    path: 'elements',
    component: ElementsComponent,
  },

  {
    path: '',
    component: AuthenticatedLayoutComponent,
    children: [
      {
        path: 'dashboard',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'profile',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'master-settings',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./master-settings/master-settings.module').then(m => m.MasterSettingsModule)
      },
      {
        path: 'blog-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./blogs/blogs.module').then(m => m.BlogsModule)
      },
      {
        path: 'page-seo-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./page-seo/page-seo.module').then(m => m.PageSeoModule)
      },
      {
        path: 'market-leaders-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./market-leader-management/market-leader-management.module').then(m => m.MarketLeaderManagementModule)
      },
      {
        path: 'department-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./department-management/department-management.module').then(m => m.DepartmentManagementModule)
      },
      {
        path: 'role-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./role-management/role-management.module').then(m => m.RoleManagementModule)
      },
      {
        path: 'user-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule)
      },
      {
        path: 'policy-management',
        canActivateChild: [AuthGuard],
        /*   resolve: {
            subModuleDetails: CheckPermissionGuard 
          }, */
        loadChildren: () => import('./policy-management/policy-management.module').then(m => m.PolicyManagementModule)
      },
      {
        path: 'claim-management',
        canActivateChild: [AuthGuard],
        /*   resolve: {
            subModuleDetails: CheckPermissionGuard 
          }, */
        loadChildren: () => import('./claim-management/claim-management.module').then(m => m.ClaimManagementModule)
      },
      {
        path: 'access-permission-management',
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./access-permisiion-management/access-permisiion-management.module').then(m => m.AccessPermisiionManagementModule),

      },
      {
        path: 'customer-management',
        canActivateChild: [AuthGuard],
        // resolve: {
        //   subModuleDetails: CheckPermissionGuard 
        // },
        loadChildren: () => import('./customer-management/customer-management.module').then(m => m.CustomerManagementModule)
      },
      {
        path: 'commission-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./commission-management/commission-management.module').then(m => m.CommissionManagementModule)
      },
      {
        path: 'sales-management',
        canActivateChild: [AuthGuard],
        // resolve: {
        //   subModuleDetails: CheckPermissionGuard
        // },
        loadChildren: () => import('./sales-management/sales-management.module').then(m => m.SalesManagementModule)
      },
         {
        path: 'plan-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },

        loadChildren: () => import('./plan-management/plan-management.module').then(m => m.PlanManagementModule)
      },
      {
        path: 'product-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./product-management/product-management.module').then(m => m.ProductManagementModule)
      },
      {
        path: 'addon-category-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./addon-category-management/addon-category-management.module').then(m => m.AddonCategoryManagementModule)
      },
      {
        path: 'affiliates-management',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./affiliates-management/affiliates-management.module').then(m => m.AffiliatesManagementModule)
      },
      {
        path: 'career-management',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./career-management/career-management.module').then(m => m.CareerManagementModule)
      }, 
      {
        path: 'contact-management',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./contact-management/contact-management.module').then(m => m.ContactManagementModule)
      },
      {
        path: 'contractor-management',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./contractor-management/contractor-management.module').then(m => m.ContractorManagementModule)
      },
      {
        path: 'real-estate-professionals-management',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./real-estate-professionals-management/real-estate-professionals-management.module').then(m => m.RealEstateProfessionalsManagementModule)
      },
      {
        path: 'settings',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'payments-management',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./payments-management/payments-management.module').then(m => m.PaymentsManagementModule)
      },
      {
        path: 'manage-tasks',
        canActivateChild: [AuthGuard],
        resolve: {
          subModuleDetails: CheckPermissionGuard
        },
        loadChildren: () => import('./task-management/task-management.module').then(m => m.TaskManagementModule)
      },

  
    ]
  },
  {
    path: 'system-admin',
    component: SystemAuthenticatedLayoutComponent,
    children: [
      {
        path: '',
        canActivateChild: [SystemAdminAuthGuard],
        loadChildren: () => import('./system-admin/system-admin.module').then(m => m.SystemAdminModule)
      }
    ]
  },
 
  {
    path: 'error',
    component: ErrorPageComponent
  },
  {
    path: 'unauthorized',
    component: ErrorUnauthorizedComponent
  },
  {
    path: '**', // wildcard will be at always last
    component: ErrorPageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule { }
