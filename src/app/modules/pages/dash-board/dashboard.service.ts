import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private Profile = '/api/dashboard/profile';
  private UpdateProfile = '/api/dashboard/UpdateProfile';
  constructor(private http: HttpClient) { }
  getProfileData() {
    const options = {
      params: new HttpParams().append('token', localStorage.getItem('token'))
    };
    return this.http.get(this.Profile, options);
  }
  updateProfile(firstName, lastName, Email, pass, newpassword, smsnotif, emailnotif, pushnotif) {
    const options = {
      params: new HttpParams().append('token', localStorage.getItem('token'))
    };
    return this.http.post(this.UpdateProfile,
      {
        FirstName: firstName,
        LastName: lastName,
        email : Email,
        password : pass,
        newPassword : newpassword,
        smsNotif : smsnotif,
        emailNotif : emailnotif,
        pushNotif : pushnotif
      }, options );
  }
}
