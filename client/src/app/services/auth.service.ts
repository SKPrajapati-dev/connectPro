import { HttpClient, HttpHeaders, HttpRequest, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { FnParam } from '@angular/compiler/src/output/output_ast';
import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { map } from 'rxjs/operators';
import * as io from 'socket.io-client';
import { analyzeAndValidateNgModules } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authToken: any;
  user: any;
  messageSend:any;
  private profile = new BehaviorSubject<any>('');
  castProfile = this.profile.asObservable();
  private socket;
  private url = 'http://localhost:3001';

  //Behavior Observable for new incoming messages
  private newMsg = new BehaviorSubject<any>('');
  //cast used to access the newMsg from components
  cast = this.newMsg.asObservable();

  constructor(private http: HttpClient){
    //Socket connection to server url
    this.socket = io.connect(this.url);
    //Socket method for receiving mesages
    this.socket.on('getMsg', (data) => {
      this.newMsg.next(data);
    });
  }


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
    let temp = this.http.get('http://localhost:3001/profile', {headers: headers});
    this.profile.next(temp);
    return temp;
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
    this.loadToken();
    let token = this.authToken;
    let headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    headers = headers.append('Authorization', token);
    this.socket.emit('disconnect', 'disconnected', function(){
      this.socket.disconnect();
    });
    this.authToken = null;
    this.user = null;
    localStorage.clear();
    return this.http.get('http://localhost:3001/logout', { headers: headers});
  }
  //Authenticating the socket connection with JWT at serverside
  getSocketAuth(){
    this.loadToken();
    this.socket.emit('userAuth', this.authToken, (callback) => {
      console.log(callback);
    });  
  }


//Getting Home Page Posts
getPosts(){
    let headers = new HttpHeaders();
    this.loadToken();
    headers.set('Content-Type', 'application/json');
    headers = headers.append('Authorization',  this.authToken);
    return this.http.get('http://localhost:3001/post/dashboard', {headers: headers});
}

//getting comments of a post
getComments(postId){
  const id = postId;
  let headers = new HttpHeaders();
  this.loadToken();
  console.log(id);
  headers.set('Content-Type', 'application/json');
  headers = headers.append('Authorization',  this.authToken);
  return this.http.get('http://localhost:3001/comment/'+id, {headers: headers});

}

postLike(postId){
     let headers = new HttpHeaders();
    this.loadToken();
    headers.set('Content-Type','application/json');
    headers = headers.append('Authorization', this.authToken);
    return this.http.post('http://localhost:3001/like/', postId, { headers: headers } );
}
  //Sending message to a specific client
  socketMessage(socketMsg){
    const senderMsg = {
      msg: socketMsg.message,
      from: this.user.email
     };
     //Sending message
     this.socket.emit('sendMsg', {msg: socketMsg.message, to: socketMsg.receiver }, (callback) => {
       if(!callback){
         console.log("User is not online"); 
       }
     });
     //Store message
    this.sendMessage(socketMsg).subscribe((data: any) => {
       console.log(data);
     });
     return senderMsg;
  }
  //API call for storing the sent message
  sendMessage(sendingMsg){
    let headers = new HttpHeaders();
    this.loadToken();
    headers.set('Content-Type','application/json');
    headers = headers.append('Authorization', this.authToken);
    return this.http.post('http://localhost:3001/message', sendingMsg, { headers: headers } );
  }


postDislike(postId){
  let headers = new HttpHeaders();
  this.loadToken();
  headers.set('Content-Type','application/json');
  headers = headers.append('Authorization', this.authToken);
  return this.http.post('http://localhost:3001/like/', postId, { headers: headers } );
}


postComment(comment){
  let headers = new HttpHeaders();
  this.loadToken();
  headers.set('Content-Type','application/json');
  headers = headers.append('Authorization', this.authToken);
  return this.http.post('http://localhost:3001/comment/comm', comment, { headers: headers } );
}


postReply(rep){
  let headers = new HttpHeaders();
  this.loadToken();
  headers.set('Content-Type','application/json');
  headers = headers.append('Authorization', this.authToken);
  return this.http.post('http://localhost:3001/comment/reply', rep, { headers: headers } );
}

deleteComment(comment_Id){
  let params = new HttpParams();
  params=params.set('comment_Id', comment_Id);
  let headers = new HttpHeaders();
  this.loadToken();
  headers.set('Content-Type','application/json');
  headers = headers.append('Authorization', this.authToken);
  return this.http.delete('http://localhost:3001/comment/'+comment_Id,{ headers: headers, params : params });
}

createPost(post){
  let headers = new HttpHeaders();
  this.loadToken();
  headers.set('Content-Type','application/json');
  headers = headers.append('Authorization', this.authToken);
  return this.http.post<any>('http://localhost:3001/post/create', post, { headers: headers } );
}



  
  //Getting the conversations
  getConversations(){
    this.loadToken();
    let headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    headers  = headers.append('Authorization', this.authToken);
    return this.http.get('http://localhost:3001/message/chats', {headers: headers});
    
  }

}
