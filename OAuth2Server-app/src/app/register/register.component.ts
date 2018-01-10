import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Custom includes



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: []
})
export class RegisterComponent implements OnInit {
  registrationRunning = false;
  registrationFailed = false;
  captchaFailed = false;
  password_confirm = ""
  registerForm: FormGroup;
  recaptcha = new FormControl(false);
  recaptchaResponse = "";
  registrationData = {};
  @ViewChild('g-recaptcha-response') captchaResponse: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef,
    private http: HttpClient
  ) {
  }

  ngOnInit() {
    let failure = this.route.snapshot.queryParams["failure"];

    this.registerForm = new FormGroup({
      'first_name': new FormControl(this.registrationData['first_name'], [
        Validators.required,
        Validators.minLength(4)
      ]),
      'last_name': new FormControl(this.registrationData['last_name'], [
        Validators.required,
        Validators.minLength(4)
      ]),
      'email': new FormControl(this.registrationData['email'], [
        Validators.required,
        Validators.email
      ]),
      'password': new FormControl(this.registrationData['password'], [
        Validators.required,
        Validators.minLength(4)
      ]),
      'confirm_password': new FormControl(this.registrationData['confirm_password'], [
        Validators.required,
      ]),
      'recaptcha': new FormControl(null, [
        Validators.required
      ]),
    });
    this.registerForm.valueChanges.subscribe(form => {
      this.registrationData['first_name'] = form.first_name;
      this.registrationData['last_name'] = form.last_name;
      this.registrationData['email'] = form.email;
      this.registrationData['password'] = form.password;
      this.registrationData['confirm_password'] = form.confirm_password;
      this.registrationData['g-recaptcha-response'] = form.recaptcha;
    });
    if (failure == 'true') {
      this.registrationFailed = true;
    } else if (failure == 'captcha') {
      this.captchaFailed = true;
    }
  }

  onSubmit() {
    console.log("form");
    // console.log(form);
    // this.registrationData['g-recaptcha-response'] = this.recaptcha;
    // console.log("captcha");
    // console.log(this.registerForm.captcha);
    console.log("registrationData: ");
    console.log(this.registrationData);
    this.http.post('/passport/signup', this.registrationData).subscribe(result => {
      console.log("error:");
      console.log(result['error']);
      console.log("target:");
      console.log(result['targetUrl']);
      let error = result['error'];
      let targetUrl = result['targetUrl'];
      if (!error && targetUrl) {
        window.location.href = targetUrl;
        // this.router.navigateByUrl(targetUrl);
      }
    });

    return
    // console.log("Submit!");
    // let registrationData = {
    //   first_name: this.user.first_name,
    //   last_name: this.user.last_name,
    //   email: this.user.email,
    //   password: this.user.password,
    //   confirm_password: this.user.password_confirm,
    //   'g-recaptcha-response': g-recaptcha-response,
    // }
    // this.registrationRunning = true;
    // this.userService.create(this.user).subscribe(res => {
    //   console.log("Result: ");
    //   console.log(res);
    // }, error => {
    //   console.log("Error: ");
    //   console.log(error);
    // });
  }

  resolved(captchaResponse: string) {
    this.registrationData['g-recaptcha-response'] = captchaResponse;
    // console.log(`Resolved captcha with response ${captchaResponse}:`);
  }

  cancelRegistration() {
    this.router.navigateByUrl('login');
  }

  onRecaptchaScriptLoad() {
    console.log("Script loaded.");
  }

  onRecaptchaScriptError() {
    console.log("Script NOT loaded.");
  }
}
