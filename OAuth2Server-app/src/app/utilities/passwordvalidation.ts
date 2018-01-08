import { AbstractControl } from '@angular/forms';
export class PasswordValidation {

    static MatchPassword(control: AbstractControl): boolean {
       let password = control.get('password').value;
       let confirmPassword = control.get('confirmPassword').value;
        if (password != confirmPassword) {
            console.log('false');
            control.get('confirmPassword').setErrors( {MatchPassword: true} )
        } else {
            console.log('true');
            return null
        }
    }
}
