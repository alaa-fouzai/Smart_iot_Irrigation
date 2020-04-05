import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Location} from '../../../../../models/Location.model';
import * as mapboxgl from 'mapbox-gl';
import Swal from 'sweetalert2';
import {User} from '../../../../../models/Use.model';
import {Sensor} from '../../../../../models/Sensor.model';

@Component({
  selector: 'app-remouve-sensor',
  templateUrl: './remouve-sensor.component.html',
  styleUrls: ['./remouve-sensor.component.scss']
})
export class RemouveSensorComponent implements OnInit {

  constructor(private http: HttpClient, private ref: ChangeDetectorRef) { }
  AddSiteApiUrl = 'api/sensors/';
  SensorDeleatAPI = 'api/sensors/remove';
  public sensors: Array<Sensor> = [];
  public locations: Array<Location> = [];
  map: mapboxgl.Map;
  CurrentUser1;
  Loaded = false;
  async ngOnInit() {
    await this.load_data();
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
            const Loc = new Location();
            Loc.SiteName = item.SiteName;
            Loc.Coordinates = item.Coordinates;
            Loc.CreatedDate = item.Created_date;
            Loc.Description = item.Description;
            Loc.id = item._id;
            Loc.SensorIds = item.Sensor_ids;
            this.locations.push(Loc);
          });
        resJSON.Sensors.forEach((item) => {
            const Sens = new Sensor();
            Sens.Name = item.name;
            Sens.SensorCoordinates = item.SensorCoordinates;
            Sens.createdate = item.Created_date;
            Sens.Description = item.Description;
            Sens.id = item._id;
            Sens.SensorType = item.SensorType;
            this.sensors.push(Sens);
          }
        );
      } else if (resJSON.status === 'err') {
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
      console.log(error.toString());
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
          this.deleateSensor(item); }
      }
    });
  }
  deleateSensor(item) {
    console.log(item.id);
    let id;
    this.locations.forEach(location => location.SensorIds.forEach( is => { if (is === item.id ) {
    id = location.id;
 }
    }));
    console.log(id);
    if (! id) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
      return ;
    }
    const options = {
      params: new HttpParams().append('token', localStorage.getItem('token'))
    };
    this.http.post(this.SensorDeleatAPI,
      {
        SensorId : item.id ,
        LocationId : id ,
      }, options).subscribe(data => {
      const resSTR = JSON.stringify(data);
      const resJSON = JSON.parse(resSTR);
      console.log(resSTR);
      if (resJSON.status === 'ok') {
        Swal.fire(
          'Deleted!',
          resJSON.message,
          'success'
        );
        this.sensors.splice(this.locations.indexOf(item), 1 );
        this.locations.forEach( (it) => {
        it.SensorIds.forEach( item1 => { if (item1 === id) {
          // @ts-ignore
          it.SensorIds.splice(item1);
        }});
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        });
        console.log(resJSON.message);
      }
      this.ref.detectChanges();
    });
  }

}
