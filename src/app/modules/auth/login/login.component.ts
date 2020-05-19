import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';
import { UserService } from '../../../services/user.service';
import {User} from '../../../models/Use.model';
import { AuthService } from 'angularx-social-login';
import { FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import {PageService} from '../../pages/pages/page.service';
declare var $;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  LoginForm: FormGroup;
  submitted = false;
  loading = false;
  private user: SocialUser;
  private loggedIn: boolean;
  public CurrentUser;
  UserService = new UserService();
  UserapiUrl = 'api/users/login';
  ConnectWithGmailApiUrl = 'api/users/loginGmail';
  constructor(
    private formBuilder: FormBuilder, private http: HttpClient, private router: Router,
    private authService: AuthService, private pageService: PageService
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
    this.LoginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pwd: ['', [Validators.required, Validators.minLength(6)]]
    });
    console.log('this.authService.authState', this.authService.authState);
  }
  get f() { return this.LoginForm.controls; }
  ngOnDestroy(): void {
    $('body').removeClass('hold-transition login-page');
  }

  onSubmit() {
    this.submitted = true;
    if (this.LoginForm.valid) {
      this.http.post(this.UserapiUrl,
        {
          email : this.LoginForm.get('email').value,
          password : this.LoginForm.get('pwd').value,
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
          localStorage.setItem('token', resJSON.token);
          console.log(resJSON.UserData[0].email);
          this.CurrentUser = new User();
          this.CurrentUser.id = resJSON.UserData[0]._id;
          this.CurrentUser.FirstName = resJSON.UserData[0].FirstName;
          this.CurrentUser.LastName = resJSON.UserData[0].LastName;
          this.CurrentUser.email = resJSON.UserData[0].email;
          this.CurrentUser.createdate = resJSON.UserData[0].Created_date;
          this.CurrentUser.locationIds = resJSON.UserData[0].Location_ids;
          localStorage.setItem('currentUser', JSON.stringify(this.CurrentUser));
          this.pageService.ConnectNotification();
          this.router.navigate(['/dashboard']);
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
        });
        console.log(JSON.stringify(error.json()));
      });
    }
  }

  ConnectWithFacebook() {
    console.log('connect With Facebook');
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      if (this.loggedIn) {
        this.connectSocialMedia(this.ConnectWithGmailApiUrl, user);
        console.log('this.user ', this.user.email);
      }
    });
  }

  ConnectWithGmail() {
    console.log('connect With Gmail');
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      if (this.loggedIn) {
        this.connectSocialMedia(this.ConnectWithGmailApiUrl, user);
      }
    });
  }
  connectSocialMedia(url , response) {

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
        localStorage.setItem('token', resJSON.token);
        console.log(resJSON.UserData[0].email);
        this.CurrentUser = new User();
        this.CurrentUser.id = resJSON.UserData[0]._id;
        this.CurrentUser.FirstName = resJSON.UserData[0].FirstName;
        this.CurrentUser.LastName = resJSON.UserData[0].LastName;
        this.CurrentUser.email = resJSON.UserData[0].email;
        this.CurrentUser.createdate = resJSON.UserData[0].Created_date;
        this.CurrentUser.locationIds = resJSON.UserData[0].Location_ids;
        localStorage.setItem('currentUser', JSON.stringify(this.CurrentUser));
        console.log('this.authService.authState', this.authService.authState);
        this.router.navigate(['/dashboard']);
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
