import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie';

// Custom includes
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthenticationService]
})
export class LoginComponent implements OnInit {
  cookieName = "iuno_login";
  loginForm: FormGroup;
  loginFailed = false;
  showIunoLogin = false;
  loginRunning = false;
  loginCredentials = {
    email: "",
    password: ""
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
    let failure = this.route.snapshot.queryParams["failure"];
    if (failure == 'true') {
      this.loginFailed = true;
      console.log("Failure!");
      this.showIunoLogin = true;
    }

    let cookieData = this.getCookie();
    if (cookieData) {
      this.loginCredentials.email = cookieData['email'];
    }
    this.removeCookie();
  }

  register() {
    this.router.navigateByUrl('register');
  }

  loginTwitter() {
    this.cookieService.remove(this.cookieName);
    window.location.href = "/passport/twitter";
  }

  loginFacebook() {
    this.cookieService.remove(this.cookieName);
    window.location.href = "/passport/facebook";
  }

  loginGoogle() {
    this.cookieService.remove(this.cookieName);
    window.location.href = "/passport/google";
  }

  openIunoLogin() {
    this.showIunoLogin = true;
  }

  closeIunoLogin() {
    this.removeCookie();
    this.loginFailed = false;
    this.showIunoLogin = false;
  }

  onSubmit() {
    this.setCookie({
      email: this.loginCredentials.email
    });
  }

  setCookie(data: any) {
    this.cookieService.put(
      this.cookieName, 
      JSON.stringify(data)
    );
  }

  getCookie(): any {
    let cookieString = this.cookieService.get(this.cookieName);
    var cookieJSON = null;
    if (cookieString) {
      cookieJSON = JSON.parse(cookieString);
    }
    return cookieJSON;
  }

  removeCookie() {
    this.cookieService.remove(this.cookieName);    
  }
}
