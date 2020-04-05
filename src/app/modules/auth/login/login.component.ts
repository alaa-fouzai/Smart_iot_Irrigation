import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';
import { UserService } from '../../../services/user.service';
import {User} from '../../../models/Use.model';
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
  public CurrentUser;
  UserService = new UserService();
  UserapiUrl = 'api/users/login';
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
    this.LoginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pwd: ['', [Validators.required, Validators.minLength(6)]]
    });
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
          )
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
          footer: JSON.stringify(error.json())
        });
        console.log(JSON.stringify(error.json()));
      });
    }
  }
}
