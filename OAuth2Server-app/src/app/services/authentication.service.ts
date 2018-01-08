import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthenticationService {

  constructor(
    private http: HttpClient
  ) { }

  login(username: string, password: string) {
    console.log("Login...");
    return this.http.post('/passport/login', {username: username, password: password}, {responseType: 'text' as 'text'}).subscribe(result => {
      console.log(result);
    });
      // .map(user => {
      //   // login successful if there's a jwt token in the response
      //   if (user && user.token) {
      //     // store user details and jwt token in local storage to keep user logged in between page refreshes
      //     localStorage.setItem('currentUser', JSON.stringify(user));
      //   }

      //   return user;
      // });
  }

}
