import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ValidateService } from 'src/app/services/validate.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: String;
  password: String;

  constructor(
    private router: Router,
    private authService: AuthService,
    private validateService: ValidateService,
    private flashMessage: FlashMessagesService
  ) { }

  ngOnInit() {
  }

  signin(){
    const user = {
      email: this.email,
      password: this.password
    }
    if(!this.validateService.validateRegister(user)){
      this.flashMessage.show('Please fill all fields', {cssClass: 'alert-danger', timeout:3000});
      return false;
    }
    //Login user
    this.authService.loginUser(user).subscribe((data: any) => {
      if(data.success){
        this.authService.storeUserData(data.token, data.user);
        this.flashMessage.show('You are logged in', {cssClass: 'alert-success', timeout:5000});
        this.router.navigate(['dashboard']);
      }else{
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout:5000});
        this.router.navigate(['/']);
      }
    });
  }

}
