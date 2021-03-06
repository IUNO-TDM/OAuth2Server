import {Component, OnInit, LOCALE_ID, Inject} from '@angular/core';
import {FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie';

// Custom includes
import {AuthenticationService} from '../services/authentication.service';

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
    notVerified = false;
    verified = false;
    showIunoLogin = false;
    loginRunning = false;
    loginCredentials = {
        email: "",
        password: ""
    };
    language = ""
    loginCountDown = 0;

    constructor(private router: Router,
        @Inject(LOCALE_ID) locale: string,
        private route: ActivatedRoute,
                private http: HttpClient,
                private formBuilder: FormBuilder,
                private authenticationService: AuthenticationService,
                private cookieService: CookieService) {
                    this.language = locale
                    this.createForm();
    }

    createForm() {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            language: ['', [Validators.required, Validators.minLength(2)]],
        });
    }

    ngOnInit() {
        // update email field depending on email parameter.
        // the field might be overwritten by cookie
        this.route.params.subscribe(params => {
            if (params['email']) {
                this.loginCredentials.email = params['email'];
                this.showIunoLogin = true;
            } else {
                this.loginCredentials.email = '';
            }
        });

        // update email field depending on cookie
        let cookieData = this.getCookie();
        if (cookieData) {
            this.loginCredentials.email = cookieData['email'];
        }
        this.removeCookie();

        // check if email was verified
        let verified = this.route.snapshot.queryParams["verified"];
        if (verified != undefined) {
            this.verified = true;
            this.showIunoLogin = true;
        }

        // check failure reasons
        let failure = this.route.snapshot.queryParams["failure"];
        switch (failure) {
            case 'INVALID_CREDENTIALS':
            case 'true':
                this.loginFailed = true;
                this.showIunoLogin = true;
                break;

            case 'NOT_VERIFIED':
                this.notVerified = true;
                this.showIunoLogin = true;
                break;

            default:
                break;
        }

        let nextValidRequestTime = this.route.snapshot.queryParams["next-valid-request-time"];
        this.countDown(nextValidRequestTime)
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
        this.verified = false;
        this.loginFailed = false;
        this.showIunoLogin = false;
        this.notVerified = false;
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

    countDown(nextValidRequestTime: any) {
        if (nextValidRequestTime < Date.now()) {
            return;
        }

        let self = this;


        self.loginCountDown = Math.floor((nextValidRequestTime - Date.now()) / 1000);


        let countDownFunction = setInterval(function () {
            self.loginCountDown = Math.floor((nextValidRequestTime - Date.now()) / 1000);
        }, 1000)


        setTimeout(function () {
            clearInterval(countDownFunction)
        }, (self.loginCountDown + 1) * 1000);

    }

    isLocked() {
        return this.loginCountDown > 0;
    }
}
