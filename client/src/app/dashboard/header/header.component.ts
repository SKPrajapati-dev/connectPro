import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: any;
  profile: any;
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.authService.getProfileViaToken().subscribe((data: any) => {
      this.profile = data;
    })
  }
  logout(){
    this.authService.logout();
    this.router.navigate(['']);
  }

}
