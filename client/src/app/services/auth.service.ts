import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import {tokenNotExpired} from 'angular2-jwt';
//copies from brad traversy
@Injectable()
export class AuthService {
  authToken: any;
  user: any;

  constructor(private http:Http) { }

  registerUser(user){
    let headerTypes = new Headers();
    headerTypes.append('Content-Type','application/json');
    return this.http.post('http://localhost:3000/users/register', user,{headers: headerTypes})
      .map(res => res.json());
  }
  authenticateUser(user){
    let headerTypes = new Headers();
    headerTypes.append('Content-Type','application/json');
    console.log(user);
    return this.http.post('http://localhost:3000/users/authenticate', user,{headers: headerTypes})
      .map(res => res.json());
  }

  getProfile(){
    let headerTypes = new Headers();
    this.loadToken();
    headerTypes.append('Authorization', this.authToken);
    headerTypes.append('Content-Type','application/json');
    return this.http.get('http://localhost:3000/users/profile',{headers: headerTypes})
      .map(res => res.json());
  }

  storeUserData(token, user){
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken(){
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  //Check to see if logged in, we use this in angular frontend to make dynamic content
  loggedIn(){
    return tokenNotExpired('id_token');
  }

  //Logs user out. Clears session storage and auth
  logout(){
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }
}
