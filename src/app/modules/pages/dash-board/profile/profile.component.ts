import {Component, OnDestroy, OnInit} from '@angular/core';
import {DashboardService} from '../dashboard.service';
import Swal from 'sweetalert2';
import {User} from '../../../../models/Use.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(private service: DashboardService, private formBuilder: FormBuilder) { }
  private user = new User();
  private timeline = [];
  userForm: FormGroup;
  submitted = false;
  Loaded = false;
  ngOnInit() {
    this.load_data();
    this.userForm = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      NewPassword: ['', [Validators.minLength(6)]],
      email: ['', [Validators.email]],
      SMSnotification: [''],
      Emailnotification: [''],
      Pushnotification: [''],
    });
  }
  get f() { return this.userForm.controls; }
  async load_data() {
    try {
      await this.service.getProfileData().subscribe(data => {
        const resSTR = JSON.stringify(data);
        const resJSON = JSON.parse(resSTR);
        if (resJSON.status === 'ok') {
          this.user.LastName = resJSON.response.user.LastName;
          this.user.id = resJSON.response.user._id;
          this.user.FirstName = resJSON.response.user.FirstName;
          this.user.email = resJSON.response.user.email;
          this.user.createdate = new Date(resJSON.response.user.Created_date);
          this.user.locationIds = resJSON.response.user.Location_ids;
          this.user.Notifications = resJSON.response.user.Notifications;
          console.log(this.user.toString());
          resJSON.response.locations.forEach(item => {
          console.log('data' , item);
          this.timeline.push(item);
          }
          );
        }
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: e.toString(),
      });
    }
    this.Loaded = true;
  }

  async submitForm() {
    this.submitted = true;
    if (this.userForm.valid) {
      await this.service.updateProfile(this.userForm.get('firstName').value, this.userForm.get('lastName').value,
        this.userForm.get('email').value,
        this.userForm.get('Password').value, this.userForm.get('NewPassword').value,
        this.userForm.get('SMSnotification').value, this.userForm.get('Emailnotification').value,
        this.userForm.get('Pushnotification').value
        ).subscribe(data => {
        const resSTR = JSON.stringify(data);
        const resJSON = JSON.parse(resSTR);
        if (resJSON.status === 'ok') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: resJSON.message,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Ooops...',
            text: resJSON.message,
          });
        }
        console.log('data', data);
      });
    }
  }
}
