import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie';
import {RecaptchaComponent} from 'ng-recaptcha/recaptcha/recaptcha.component';

@Component({
  selector: 'app-reset-password-mail',
  templateUrl: './reset-password-mail.component.html',
  styleUrls: ['./reset-password-mail.component.scss']
})
export class ResetPasswordMailComponent implements OnInit {
  form: FormGroup;
  resetSuccess = false;
  resetFailedCaptcha = false;
  resetFailed = false;
  resetFailedUnknownUser = false;
  email = "";

  constructor(private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private cookieService: CookieService) {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      recaptcha: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.email = params['email'];
    });

    let failure = this.route.snapshot.queryParams["failure"];
    if (failure == 'true') {
      this.resetFailed = true;
    } else if (failure == 'unknown_user') {
      this.resetFailedUnknownUser = true;
    } else if (failure == 'captcha') {
      this.resetFailedCaptcha = true;
    }

    let success = this.route.snapshot.queryParams["success"];

    if (success != undefined) {
      this.resetSuccess = true;
    }
  }

  onSubmit() {
  }

}
