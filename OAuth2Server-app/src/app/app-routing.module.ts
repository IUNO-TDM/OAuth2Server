import { NgModule } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResendEmailVerificationComponent } from './resend-email-verification/resend-email-verification.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'login/:email', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'reset-password', component: ResetPasswordComponent},
  {path: 'reset-password/:email', component: ResetPasswordComponent},
  {path: 'resend-email-verification', component: ResendEmailVerificationComponent},
  {path: 'resend-email-verification/:email', component: ResendEmailVerificationComponent},
  {path: '**', redirectTo: 'login'},
];

@NgModule({
//  imports: [RouterModule.forRoot(routes, { enableTracing: true })], // Just for debugging
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
