import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

// Custom includes
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [UserService]
})
export class RegisterComponent implements OnInit {
  registrationRunning = false;
  registrationFailed = false;
  user = new User();
  password_confirm = ""
  registerForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
  ) {
  }

  ngOnInit() {
    let failure = this.route.snapshot.queryParams["failure"];

    this.registerForm = new FormGroup({
      'first_name': new FormControl(this.user.first_name, [
        Validators.required,
        Validators.minLength(4)
      ]),
      'last_name': new FormControl(this.user.last_name, [
        Validators.required,
        Validators.minLength(4)
      ]),
      'email': new FormControl(this.user.email, [
        Validators.required,
        Validators.email
      ]),
      'password': new FormControl(this.user.password, [
        Validators.required,
        Validators.minLength(4)
      ]),
      'password_confirm': new FormControl(this.password_confirm, [
        Validators.required,
      ]),
    });
    this.registerForm.valueChanges.subscribe(form => {
      this.user.first_name = form.first_name;
      this.user.last_name = form.last_name;
      this.user.email = form.email;
      this.user.password = form.password;
    });
    if (failure == 'true') {
      this.registrationFailed = true;
    }
  }

  register() {
    console.log("Register");
    // this.registrationRunning = true;
    // this.userService.create(this.user).subscribe(res => {
    //   console.log("Result: ");
    //   console.log(res);
    // }, error => {
    //   console.log("Error: ");
    //   console.log(error);
    // });
  }

  cancelRegistration() {
    this.router.navigateByUrl('login');
  }
}
