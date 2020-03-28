import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { empty } from 'rxjs';
import { analyzeAndValidateNgModules } from '@angular/compiler';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: any;
  newProfile: any;
  confirmpassword: String;
  updatedAccount: any;
  newExperience: { title: String, location: String, company: String, description: String, from: Date, to: Date, current: Boolean };
  removeSelect: any;
  removeEducation: any;
  newEducation: { degree: String, location: String, institute: String, description: String, fieldofstudy: String, from: Date, to: Date, current: Boolean };

  constructor(
    private authService: AuthService, 
    private flashMessage: FlashMessagesService,
    private router: Router
    ) { }

  ngOnInit() {
    this.authService.getProfileViaToken().subscribe((data: any) => {
      this.profile = data;
      this.newProfile = this.profile;
      this.updatedAccount = this.profile.user;
      this.newExperience = { 
        title: '',
        location: '',
        company: '',
        description: '',
        from: null,
        to: null,
        current: false
      };
      this.newEducation = { degree: '', location: '', description: '', fieldofstudy: '', institute: '', from: null, to: null, current: false };
    },
    err => {
      console.log(err);
      return false;
    });
  }

  updateProfile(){
    this.newProfile.twitter = this.newProfile.social.twitter;
    this.newProfile.youtube = this.newProfile.social.youtube;
    this.newProfile.linkedin = this.newProfile.social.linkedin;
    this.newProfile.facebook = this.newProfile.social.facebook;
    this.newProfile.instagram = this.newProfile.social.instagram;
    this.authService.updateProfileViaToken(this.newProfile).subscribe((success: any) => {
      if(success){
        this.flashMessage.show('Updated Profile Successfully',{cssClass: 'alert-success', timeout: 5000});
      }
    });
    
  }

  updateAccount(){
    if(this.updatedAccount.password.toString() == this.confirmpassword){
      this.authService.updateAccountDetails(this.updatedAccount).subscribe((success: any) => {
        if(success){
          this.flashMessage.show('Updated Account Succesfully, You need to be login Again', {cssClass: 'alert-success', timeout:5000});
          this.authService.logout();
          this.router.navigate(['/']);
        }else{
          this.flashMessage.show('Something went wrong', {cssClass: 'alert-danger', timeout:5000});
        }
      });
    }
  }
  addEducation(){
    this.authService.addEducation(this.newEducation).subscribe((success: any) => {
      if(success){
        this.flashMessage.show('Added New Education',{cssClass: 'alert-success', timeout:5000});
      }
    });
  }
  addExperience(){
    this.authService.addExperience(this.newExperience).subscribe((success: any) => {
      if(success){
        this.flashMessage.show('Added New Experience',{cssClass:'alert-success',timeout:5000});
      }
    });
  }

  removeExperience(){
    this.authService.removeExperience(this.removeSelect).subscribe((success: any) => {
      if(success){
        this.flashMessage.show('Removed Experience Successfully',{cssClass: 'alert-success',timeout: 5000});
      }
    });
  }

  removeSelectedEducation(){
    this.authService.removeSelectedEducation(this.removeEducation).subscribe((success: any ) => {
      if(success){
        this.flashMessage.show('Removed Education Successfully',{cssClass: 'alert-success', timeout: 5000});
      }
    });
  }

}
