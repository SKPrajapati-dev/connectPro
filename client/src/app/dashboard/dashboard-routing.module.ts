import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ConsoleComponent } from './console/console.component';
import { FooterComponent } from './footer/footer.component';
import { SettingsComponent } from './settings/settings.component';
import { DashboardComponent } from './dashboard.component';
import { ProfileComponent } from './main-contents/profile/profile.component';
import { PostComponent } from './main-contents/post/post.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: '',
        component: PostComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
