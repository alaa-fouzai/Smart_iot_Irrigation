import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';


declare var $;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  UserapiUrl = 'api/users/register';
  constructor(
    private formBuilder: FormBuilder, private http: HttpClient, private router: Router
  ) {
  }

  ngOnInit() {
    $('body').addClass('hold-transition login-page');
    $(() => {
      $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' /* optional */
      });
    });

    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  get f() { return this.registerForm.controls; }
  ngOnDestroy(): void {
    $('body').removeClass('hold-transition login-page');
  }
  onSubmit() {
    this.submitted = true;
    if (this.registerForm.valid) {
    this.http.post(this.UserapiUrl,
      {
        FirstName: this.registerForm.get('firstName').value ,
        LastName: this.registerForm.get('lastName').value,
        email : this.registerForm.get('email').value,
        password : this.registerForm.get('password').value,
        enabled : 1
      } ).subscribe(data => {
        console.log(data);
        const resSTR = JSON.stringify(data);
        const resJSON = JSON.parse(resSTR);
        console.log(resJSON.status);
        if (resJSON.status === 'ok') {
          Swal.fire(
          'Account Created!',
            resJSON.message,
          'success'
        );
          this.router.navigate(['/auth/login/']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: resJSON.message,
          });
        }
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
        footer: JSON.stringify(error.json())
      });
      console.log(JSON.stringify(error.json()));
    });
    }
  }

}
