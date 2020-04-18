import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../services/validate.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name: String;
  email: String;
  password: String;
  password2: String;

  constructor(
    private validateService: ValidateService,
    private router: Router,
    private flashMessage: FlashMessagesService,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }
  registerUser(){
    const newUser = {
      name: this.name,
      email: this.email,
      password: this.password
    }
    if(!this.validateService.validatePassword(newUser.password, this.password2)){
      this.flashMessage.show('Password dont Match', {cssClass: 'alert-danger', timeout:3000});
      return false;
    }

    //Register User
    this.authService.registerUser(newUser).subscribe((data: any) => {
      if(data.success){
        this.flashMessage.show('Registered Successfully', {cssClass: 'alert-success', timeout:3000});
        this.router.navigate(['/']);
      }else{
        this.flashMessage.show('Something is Wrong', {cssClass: 'alert-warning', timeout:3000});
        this.router.navigate(['/register']);
      }
    });
  }

}
