import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Location} from '../../../../../models/Location.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import Swal from 'sweetalert2';
import * as mapboxgl from 'mapbox-gl';
import {User} from '../../../../../models/Use.model';

@Component({
  selector: 'app-remouve-site',
  templateUrl: './remouve-site.component.html',
  styleUrls: ['./remouve-site.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class RemouveSiteComponent implements OnInit {

  constructor(private http: HttpClient, private ref: ChangeDetectorRef) { }
  AddSiteApiUrl = 'api/location/';
  LocationDeleatAPI = 'api/location/remouve';
  public locations: Array<Location> = [];
  map: mapboxgl.Map;
  CurrentUser1;
  Loaded = false;
  async ngOnInit() {
    await this.load_data();
    console.log('locations');
    console.log(this.Loaded);
    console.log(this.locations);
  }
   async load_data() {
     const options = {
       params: new HttpParams().append('token', localStorage.getItem('token'))
     };
     await this.http.get(this.AddSiteApiUrl, options).subscribe(data => {
       const resSTR = JSON.stringify(data);
       const resJSON = JSON.parse(resSTR);
       if (resJSON.status === 'ok') {
         resJSON.Locations.forEach((item) => {
             const loc = new Location();
             loc.SiteName = item.SiteName;
             loc.Coordinates = item.Coordinates;
             loc.CreatedDate = item.Created_date;
             loc.Description = item.Description;
             loc.id = item._id;
             loc.SensorIds = item.Sensor_ids;
             this.locations.push(loc);
           }
         );
       } else {
         Swal.fire({
           icon: 'error',
           title: 'Oops...',
           text: resJSON.message,
         });
       }
     }, error => {
       console.log(error.toString());
       Swal.fire({
         icon: 'error',
         title: 'Oops...',
         text: 'Something went wrong!',
       });
       console.log(error);
     });
     console.log(this.Loaded);
     this.Loaded = true;
     this.ref.detectChanges();
   }
  remove(item) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {
        if (result.value) {
          this.deleatelocation(item); }
      }
    });
  }
  deleatelocation(item) {
    console.log(item.id);
    const options = {
      params: new HttpParams().append('token', localStorage.getItem('token'))
    };
    this.http.post(this.LocationDeleatAPI,
      {
        LocationId : item.id ,
      }, options).subscribe(data => {
      const resSTR = JSON.stringify(data);
      const resJSON = JSON.parse(resSTR);
      console.log(resSTR);
      Swal.fire(
        'Deleted!',
         resJSON.message,
        'success'
      );
      this.CurrentUser1 = new User();
      this.CurrentUser1.id = resJSON.UserData._id;
      this.CurrentUser1.FirstName = resJSON.UserData.FirstName;
      this.CurrentUser1.LastName = resJSON.UserData.LastName;
      this.CurrentUser1.email = resJSON.UserData.email;
      this.CurrentUser1.createdate = resJSON.UserData.Created_date;
      this.CurrentUser1.locationIds = resJSON.UserData.Location_ids;
      localStorage.setItem('currentUser', JSON.stringify(this.CurrentUser1));
      this.ref.detectChanges();
    });
  }
}
