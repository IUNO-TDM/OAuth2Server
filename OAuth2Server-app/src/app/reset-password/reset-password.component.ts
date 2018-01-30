import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie';
import {RecaptchaComponent} from 'ng-recaptcha/recaptcha/recaptcha.component';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  resetSuccess = false;
  resetFailedCaptcha = false;
  resetFailed = false;
  resetFailedUnknownUser = false;
  email = "";
  key = "";

  constructor(private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private cookieService: CookieService) {
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
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      key: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required],
      recaptcha: [null, Validators.required],
    }, {
        validator: this.checkPasswordMatch('password', 'confirm_password')
      });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.key = params['key'];
    });
    this.route.params.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });

    let success = this.route.snapshot.queryParams["success"];
    if (success != undefined) {
      this.resetSuccess = true;
    }
  }

  onSubmit() {

  }

}
