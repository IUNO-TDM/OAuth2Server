import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

// Custom includes
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthenticationService]  
})
export class LoginComponent implements OnInit {
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
    private authenticationService: AuthenticationService
  ) { }
  
  ngOnInit() {
    let failure = this.route.snapshot.queryParams["failure"];
    this.loginForm = new FormGroup({
      'email': new FormControl(this.loginCredentials.email, [
        Validators.required,
        Validators.minLength(4)
      ]),
      'password': new FormControl(this.loginCredentials.password, [
        Validators.required,
        Validators.minLength(4)
      ]),
    });
    this.loginForm.valueChanges.subscribe(form => {
      this.loginCredentials.email = form.email;
      this.loginCredentials.password = form.password;
    });
    if (failure == 'true') {
      this.loginFailed = true;
      console.log("Failure!");
      this.showIunoLogin = true;
    }
  }

  register() {
    this.router.navigateByUrl('register');
  }

  loginTwitter() {
    window.location.href="/passport/twitter";
  }

  loginFacebook() {
    window.location.href="/passport/facebook";
  }

  loginGoogle() {
    window.location.href="/passport/google";
  }

  openIunoLogin() {
    this.showIunoLogin = true;
  }

  closeIunoLogin() {
    this.loginFailed = false;
    this.showIunoLogin = false;
  }

  iunoLogin() {
    this.loginRunning = true;
    // this.loginForm.submit();
    // this.authenticationService.login(this.loginCredentials.user, this.loginCredentials.password);
        // .subscribe(
        //     data => {
        //         // this.router.navigate([this.returnUrl]);
        //     },
        //     error => {
        //         // this.alertService.error(error);
        //         this.loginRunning = false;
        //     });
  }
}
