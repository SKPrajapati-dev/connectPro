import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupModule } from './signup/signup.module';
import { DashboardModule } from './dashboard/dashboard.module';

const routes: Routes = [
  
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
