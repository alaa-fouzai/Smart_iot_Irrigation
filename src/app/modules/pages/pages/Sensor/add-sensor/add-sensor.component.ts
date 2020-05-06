import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import Swal from 'sweetalert2';
import {User} from '../../../../../models/Use.model';
import {Location} from '../../../../../models/Location.model';
import * as mapboxgl from 'mapbox-gl';
import {environment} from '../../../../../../environments/environment';
import * as MapboxLanguage from '@mapbox/mapbox-gl-language';
@Component({
  selector: 'app-add-sensor',
  templateUrl: './add-sensor.component.html',
  styleUrls: ['./add-sensor.component.scss']
})
export class AddSensorComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router) { }
  AddSensorForm: FormGroup;
  Sensorfound = 'NaN';
  SensorId;
  SensorFoundId;
  loading = false;
  public el = new mapboxgl.Marker();
  public em = new mapboxgl.Marker({color: 'red'});
  submitted = false;
  public locations: Array<Location> = [];
  AddSensorApiUrl = 'api/location/';
  scope;
  Longitude = 0;
  Latiude = 0;
  map: mapboxgl.Map;
  private CurrentUser: any;
  AddSensorUrl = 'api/sensors/Add';
  findSensorApiUrl = 'api/sensors/find';
  selected;
  SensorTypes = ['Temperature', 'humidity', ];
  public model: any;
  get f() { return this.AddSensorForm.controls; }
  formatter = (result: string) => result.toUpperCase();
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.SensorTypes.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );
  ngOnInit() {
    this.AddSensorForm = this.formBuilder.group({
      SensorName: ['', Validators.required],
      SensorId: ['', Validators.required],
      SensorCoordinates : [this.Longitude, this.Latiude],
      SensorLocation : ['', Validators.required],
      Description: ['', [Validators.maxLength(255)]],
    });
    this.Sensorfound = 'NaN';
    this.load_data();

  }
  onSubmit() {
    this.submitted = true;
    console.log(this.AddSensorForm.get('SensorName').value, this.AddSensorForm.get('SensorLocation').value);
    if (this.AddSensorForm.valid) {
      const options = {
        params: new HttpParams().append('token', localStorage.getItem('token'))
      };
      this.http.post(this.AddSensorUrl,
        {
          SensorName : this.AddSensorForm.get('SensorName').value,
          SensorId : this.SensorFoundId,
          Description : this.AddSensorForm.get('Description').value,
          SensorCoordinates : [this.Longitude, this.Latiude],
          LocationId : this.AddSensorForm.get('SensorLocation').value,
        }, options ).subscribe(data => {
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
          footer: JSON.stringify(error)
        });
        console.log(JSON.stringify(error));
      });
    }
  }
  LoadLoacation(event) {
    const value = event.target.value;
    this.selected = value;
    const loc = this.locations.filter( x => x.id === event.target.value);
    try {
      let longitu = 0;
      let latite = 0;
      // @ts-ignore
      longitu = loc[0].Coordinates[0];
      // @ts-ignore
      this.Longitude = loc[0].Coordinates[0];
      // @ts-ignore
      latite = loc[0].Coordinates[1];
      // @ts-ignore
      this.Latiude = loc[0].Coordinates[1];
      this.el.setLngLat([longitu, latite]).setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML('<h1>' + loc[0].SiteName + '</h1><p>' + loc[0].SensorIds.length + ' sensors ' + '</p>'))
        .addTo(this.map);
    } catch (e) {
      console.log(e);
    }
  }
  add_map() {
    this.CurrentUser = JSON.parse(localStorage.getItem('currentUser'));
    (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
    /*mapboxgl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
      null,
      true // Lazy load the plugin
    );*/
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v10',
      zoom: 9,
      center: [10.196506147691451 , 36.792635314317465],
    });
    // Add map controls
    this.map.addControl(new mapboxgl.NavigationControl() );
    const language = new MapboxLanguage({
      defaultLanguage: 'en'
    });
    this.map.addControl(language);
    this.map.on('click', hello => {
      this.Longitude = hello.lngLat.lng;
      this.Latiude = hello.lngLat.lat;
      this.em.setLngLat([hello.lngLat.lng, hello.lngLat.lat])
        .addTo(this.map);
    });

  }
  async load_data(): Promise<Array<Location>> {
    const options = {
      params: new HttpParams().append('token', localStorage.getItem('token'))
    };
    await this.http.get(this.AddSensorApiUrl, options).subscribe(data => {
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
    this.add_map();
    return this.locations;
  }

  searchAnimation() {
    this.Sensorfound = 'searching';
    this.findSensor();
  }
  findSensor() {
    console.log('SensorId ', this.AddSensorForm.get('SensorId').value);
    const options = {
        params: new HttpParams().append('token', localStorage.getItem('token'))
      };
    this.http.post(this.findSensorApiUrl,
        {
          Sensorid : this.AddSensorForm.get('SensorId').value,
        }, options ).subscribe(data => {
        console.log(data);
        const resSTR = JSON.stringify(data);
        const resJSON = JSON.parse(resSTR);
        console.log(resJSON.token);
        if (resJSON.status === 'ok') {
          Swal.fire(
            'Found !',
            resJSON.message,
            'success'
          );
          this.Sensorfound = 'found';
          this.SensorFoundId = resJSON.SensorFoundId;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: resJSON.message,
          });
          this.Sensorfound = 'done';
        }
      }, error => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        });
        console.log(JSON.stringify(error));
      });
  }
}
