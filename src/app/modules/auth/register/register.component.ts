import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';
import {User} from '../../../models/Use.model';
import { AuthService } from 'angularx-social-login';
import { FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';

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
  private user: SocialUser;
  private loggedIn: boolean;
  UserapiUrl = 'api/users/register';
  RegisterWithGmailApiUrl = 'api/users/RegisterGmail';
  constructor(
    private formBuilder: FormBuilder, private http: HttpClient, private router: Router, private authService: AuthService
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
  RegisterWithGmail() {
    console.log('connect With Gmail');
    try {
      this.authService.signOut();
    } catch (e) {}
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    this.authService.authState.subscribe((user) => {
      console.log('user from inside subscribe', this.user);
      this.user = user;
      this.loggedIn = (user != null);
      if (this.loggedIn) {
        this.RegisterSocial(this.RegisterWithGmailApiUrl , this.user);
      }
    });
  }
  RegisterSocial(url , response) {

    this.http.post(url,
      {
        resp : response,
      } ).subscribe(data => {
      console.log(data);
      const resSTR = JSON.stringify(data);
      const resJSON = JSON.parse(resSTR);
      console.log(resJSON.token);
      if (resJSON.status === 'ok') {
        Swal.fire(
          'Welcome!',
          resJSON.message,
          'success'
        );
        console.log('this.authService.authState', this.authService.authState);
        this.authService.signOut();
        this.router.navigate(['auth/login']);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: resJSON.message,
        });
        this.authService.signOut();
      }
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
      console.log(JSON.stringify(error));
    });
    this.authService.signOut();
  }

}
