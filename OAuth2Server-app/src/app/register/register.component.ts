import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { FormControl, AbstractControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RecaptchaComponent } from 'ng-recaptcha/recaptcha/recaptcha.component';
import { CookieService } from 'ngx-cookie';

// Custom includes

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: []
})
export class RegisterComponent implements OnInit {
  cookieName = "iuno_register";
  registrationRunning = false;
  registrationFailed = false;
  captchaFailed = false;
  registrationForm: FormGroup;
  recaptcha = new FormControl(false);
  registrationData = {
    firstName: "",
    lastName: "",
    email: ""
  }
  // @ViewChild('g-recaptcha-response') captchaResponse: ElementRef;
  // @ViewChild('captchaControl') captchaRef: RecaptchaComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private cookieService: CookieService    
  ) {
    this.createForm();
  }

  checkPasswordMatch(passwordFieldName: string, passwordConfirmFieldName: string) {
    return (group: FormGroup) => {
      let password = group.controls[passwordFieldName];
      let passwordConfirm = group.controls[passwordConfirmFieldName];
      if (password.value !== passwordConfirm.value) {
        return passwordConfirm.setErrors({notEquivalent: true})
      } else {
          return passwordConfirm.setErrors(null);
      }
    }
  }

  createForm() {
    this.registrationForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required],
      recaptcha: [null, Validators.required],
    }, {
        validator: this.checkPasswordMatch('password', 'confirm_password')
      });
  }

  ngOnInit() {
    let failure = this.route.snapshot.queryParams["failure"];
    if (failure == 'true') {
      this.registrationFailed = true;
    }

    let cookieData = this.getCookie();
    if (cookieData) {
      this.registrationData['first_name'] = cookieData['first_name'];
      this.registrationData['last_name'] = cookieData['last_name'];
      this.registrationData['email'] = cookieData['email'];
      this.removeCookie();
    }
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

  onSubmit() {
    this.setCookie(this.registrationData);
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
