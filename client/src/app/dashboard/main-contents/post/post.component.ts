import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { isEmpty } from 'rxjs/operators';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  posts:any;
  user: any;
  profile: any;
  comments:any;
  postId:any;
  likedPost:any;
  comment:any;
  reply:any;
  delComment:any;
  post:any;
  image:any;

  constructor(
    private authService: AuthService, 
    private flashMessage: FlashMessagesService,
    private router: Router
  ) { }


  ngOnInit() {
    this.likedPost='';
    this.comments='';
    this.posts='';
    this.postId='';
    this.comment={
      text:''
    }
    this.reply={
      text:''
    }
    this.delComment={
      comment_ids:''
    }
    this.post={
      caption:''
    }
    this.image = '';
    this.showPosts();
    this.user = this.authService.getUser();
    this.authService.getProfileViaToken().subscribe((data: any) => {
    this.profile = data;
    console.log(this.user);
    })
  }

 showPosts(){
    this.authService.getPosts().subscribe((data:any) => {
    this.postId = data;
    this.posts=data;
    //Converting Object to Array
    this.posts = Object.entries(this.posts).map(([type, value]) => ({type, value}))
    console.log(this.postId);
    
   })
 
}

postLike(){
    this.authService.postLike(this.postId).subscribe((data:any)=>{
    this.likedPost = data;
  })
}


postComment(id){
  console.log(id);
  this.comment={
    postid:id,
    comment:this.comment.text
  }
  this.authService.postComment(this.comment).subscribe((data:any)=>{
    if(data){
      console.log("success");
    }
  })
}

postReply(commentId){
  this.reply = {
    text:this.reply.text,
    commentid:commentId
  }

  this.authService.postReply(this.reply).subscribe((data:any)=>{})
}


deleteComment(commentID){
  this.authService.deleteComment(commentID).subscribe((data:any)=>{
    console.log(data);
  })
}


selectImage(event){
  if(event.target.files.length > 0){
    const file = event.target.files[0];
    this.image = file;
  } 
}

postPost(){
  const formData = new FormData();
  formData.append('post', this.image);
  formData.append('caption', this.post.caption);
  this.authService.createPost(formData).subscribe((data:any)=>{
    console.log(data);
  }) 
}

}