import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignupRoutingModule } from './signup-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FlashMessagesModule, FlashMessagesService } from 'angular2-flash-messages';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    SignupRoutingModule,
    FlashMessagesModule.forRoot()
  ],
  providers: [FlashMessagesService]
})
export class SignupModule { }
