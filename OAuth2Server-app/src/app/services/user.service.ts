import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Custom imports
import { User } from '../models/user';

@Injectable()
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  create(user: User) {
    console.log(user);
    return this.http.post('/passport/signup', user);
  }
}
