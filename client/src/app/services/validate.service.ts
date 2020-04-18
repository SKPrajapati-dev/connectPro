import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor() { }

  validateRegister(user){
    if(user.email == undefined || user.password == undefined){
      return false;
    }else{
      return true;
    }
  }

  validatePassword(password, password2){
    if(password == password2){
      return true;
    }else{
      return false;
    }
  }
}
