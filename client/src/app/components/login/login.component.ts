import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService} from 'angular2-flash-messages';
import { Router } from '@angular/router';
//Credit to Brad Traversy for authentication https://github.com/bradtraversy/meanauthapp 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: String;
  password: String;
  constructor(
    private router:Router,
    private authService:AuthService,
    private flashMessage:FlashMessagesService
  ) { }

  ngOnInit() {
  }

  loginSubmit(){
    let newLogin = {
      username: this.username,
      password: this.password
    };

    this.authService.authenticateUser(newLogin).subscribe(data => {
      if(data.success){
        this.authService.storeUserData(data.token, data.user);
        this.flashMessage.show('You are logged in as ' + newLogin.username, {cssClass: 'alert-success', timeout: 4000});
        this.router.navigate(['/chat']);
      } else{
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3500});
        this.router.navigate(['/login']);
      }

    });
  }
}
