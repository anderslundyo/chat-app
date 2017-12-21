import { Injectable } from '@angular/core';
//copies from brad traversy
@Injectable()
export class ValidateService {

  constructor() { }
  //email validation regex
  validateEmail(newEmail){
    const validation = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return validation.test(newEmail);
  }

  //Returns false if no info is entered, returns true if theres content in every field
  validateRegister(newUser){
    if(newUser.name == undefined || newUser.email == undefined || newUser.username == undefined || newUser.password == undefined){
      return false;
    } else {
      return true;
    }
  }

}
