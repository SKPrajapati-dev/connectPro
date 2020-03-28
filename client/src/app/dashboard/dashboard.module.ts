import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { HeaderComponent } from './header/header.component';
import { ConsoleComponent } from './console/console.component';
import { SettingsComponent } from './settings/settings.component';
import { FooterComponent } from './footer/footer.component';
import { AuthService } from '../services/auth.service';
import { FlashMessagesService, FlashMessagesModule } from 'angular2-flash-messages';
import { DashboardComponent } from './dashboard.component';
import { ProfileComponent } from './main-contents/profile/profile.component';
import { FormsModule } from '@angular/forms';
import { PostComponent } from './main-contents/post/post.component';



@NgModule({
  declarations: [
    DashboardComponent, 
    HeaderComponent, 
    ConsoleComponent, 
    SettingsComponent, 
    FooterComponent, 
    ProfileComponent, PostComponent],
  imports: [
    CommonModule,
    FormsModule,
    FlashMessagesModule,
    DashboardRoutingModule
  ],
  providers: [AuthService, FlashMessagesService],
  exports: [HeaderComponent, ConsoleComponent, SettingsComponent, FooterComponent]
})
export class DashboardModule { }
