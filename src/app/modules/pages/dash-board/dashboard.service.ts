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
  async ProcessWeitherdata(WeitherData) {
    console.log('*************// weither process **************');
    // console.log(WeitherData);
    const WeitherWidget = [];
    // make a array with laymet lkol
    const tableDesJour = [];
    const jourdata = [];
    WeitherData.weither.list.forEach(block => {
        const datejour = new Date(block.dt * 1000).toDateString();
        let exist = false;
        tableDesJour.forEach( item => {
          if (item.dayOfMonth === datejour) {
            if (exist !== true) {
              item.values.push(block);
              exist = true;
            }
          }
        });
        if (exist === false) {
          const x: any = {};
          x.dayOfMonth = datejour;
          x.values = [];
          x.values.push(block);
          tableDesJour.push(x);
        }
      }
    );
    console.log('weither by date' , tableDesJour);
    // get best values
    tableDesJour.forEach(item => {
      let maxTemp = 0;
      let humidity = 0;
      let precipitation = 0;
      let weither;
      item.values.forEach(values => {
      if (maxTemp < values.main.temp) {
          maxTemp = values.main.temp;
          weither = values.weather[0].main;
      }
      if (humidity < values.main.humidity) {
        humidity = values.main.humidity;
      }
      if ( values.rain ) {
        const rain3h = values.rain;
        precipitation += Math.round((rain3h['3h'] / 3) * 100);
        weither = values.weather[0].main;
      }
      }
      );
      const object: any = {};
      object.date = item.dayOfMonth;
      object.humidity = humidity;
      object.maxTemp = maxTemp;
      object.weither = weither;
      object.precipitation = precipitation;
      WeitherWidget.push(object);
      console.log('max temp for ', item.dayOfMonth , maxTemp);
      console.log('max hum for ', item.dayOfMonth , humidity);
      console.log('precipitation ', item.dayOfMonth , precipitation);
    });
    console.log('************// weither process **********');
    return WeitherWidget;
  }
}
