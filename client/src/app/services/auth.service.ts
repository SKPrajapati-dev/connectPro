import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authToken: any;
  user: any;

  constructor(private http: HttpClient) { }

  //Register new User
  registerUser(newUser){
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3001/signup', newUser, {headers: headers});
  }

  loginUser(user){
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3001/login', user, {headers: headers});
  }

  //getting user from localstorage
  getUser(){
    this.user = JSON.parse(localStorage.getItem('user'));
    return this.user;
  }

  //Storing Token
  storeUserData(token, user){
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }
  //Getting Profile from Server
  getProfileViaToken(){
    let headers = new HttpHeaders();
    this.loadToken();
    headers.set('Content-Type', 'application/json');
    headers = headers.append('Authorization',  this.authToken);
    return this.http.get('http://localhost:3001/profile', {headers: headers});
  }

  //Updating Porfile Api Call
  updateProfileViaToken(newData){
    let headers = new HttpHeaders();
    this.loadToken();
    headers.set('Content-Type', 'application/json');
    headers = headers.append('Authorization', this.authToken);
    return this.http.post('http://localhost:3001/profile', newData, { headers: headers});
  }


  //Update Account details
  updateAccountDetails(updatedAccount){
    let headers = new HttpHeaders();
    this.loadToken();
    headers.set('Content-Type', 'application/json');
    headers = headers.append('Authorization', this.authToken);
    return this.http.post('http://localhost:3001/profile/account', updatedAccount, { headers: headers });
  }

  //Adding New Experience
  addExperience(newExperience){
    let headers = new HttpHeaders();
    this.loadToken();
    headers.set('Content-Type','application/json');
    headers = headers.append('Authorization', this.authToken);
    return this.http.post('http://localhost:3001/profile/experience', newExperience, { headers: headers });
  }

  //Adding New Education
  addEducation(newEducation){
    let headers = new HttpHeaders();
    this.loadToken();
    headers.set('Content-Type','application/json');
    headers = headers.append('Authorization', this.authToken);
    return this.http.post('http://localhost:3001/profile/education', newEducation, { headers: headers } );
  }

  //Removing Experience
  removeExperience(removeSelect){
    let headers = new HttpHeaders();
    this.loadToken();
    headers.set('Content-Type', 'application/json');
    headers = headers.append('Authorization', this.authToken);
    return this.http.delete('http://localhost:3001/profile/experience/'+removeSelect, { headers: headers });
  }

  //Removing Education
  removeSelectedEducation(removeEduaction){
    let headers = new HttpHeaders();
    this.loadToken();
    headers.set('Content-Type','application/json');
    headers = headers.append('Authorization', this.authToken);
    return this.http.delete('http://localhost:3001/profile/education/'+removeEduaction, { headers: headers });
  }
  //Loading Token from localstorage
  loadToken(){
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }
  //Logout
  logout(){
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }
}