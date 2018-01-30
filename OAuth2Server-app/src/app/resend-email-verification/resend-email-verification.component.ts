import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie';
import { RecaptchaComponent } from 'ng-recaptcha/recaptcha/recaptcha.component';

// Custom includes
import { AuthenticationService } from '../services/authentication.service';

@Component({
    selector: 'app-resend',
    templateUrl: './resend-email-verification.component.html',
    styleUrls: ['./resend-email-verification.component.scss'],
    providers: [AuthenticationService]
})
export class ResendEmailVerificationComponent implements OnInit {
    cookieName = "iuno_login";
    resendForm: FormGroup;
    resendFailed = false;
    resendFailedUnknownUser = false;
    resendFailedAlreadyVerified = false;
    resendRunning = false;
    resendSuccess = false;
    captchaFailed = false;
    loginCredentials = {
        email: "",
        password: ""
    };

    constructor(private router: Router,
        private route: ActivatedRoute,
        private http: HttpClient,
        private formBuilder: FormBuilder,
        private authenticationService: AuthenticationService,
        private cookieService: CookieService) {
        this.createForm();
    }

    createForm() {
        this.resendForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            recaptcha: [null, Validators.required],
        });
    }

    ngOnInit() {
        // update email field depending on email parameter.
        // the field might be overwritten by cookie
        this.route.params.subscribe(params => {
            this.loginCredentials.email = params['email'];
        });

        // update email field depending on cookie
        let cookieData = this.getCookie();
        if (cookieData) {
            this.loginCredentials.email = cookieData['email'];
        }

        // check failure reasons
        let failure = this.route.snapshot.queryParams["failure"];
        if (failure == 'true') {
            this.resendFailed = true;
        } else if (failure == 'unknown_user') {
            this.resendFailedUnknownUser = true;
        } else if (failure == 'already_verified') {
            this.resendFailedAlreadyVerified = true;
        } else if (failure == 'captcha') {
            this.captchaFailed = true;
        }

        // check success
        let success = this.route.snapshot.queryParams["success"];
        if (success) {
            this.resendSuccess = true;
        }

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
