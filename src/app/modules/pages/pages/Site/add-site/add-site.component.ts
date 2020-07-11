import { Component, OnInit } from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormBuilder, Validators} from '@angular/forms';
import {HttpClient, HttpHeaders , HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxLanguage from '@mapbox/mapbox-gl-language';

import Swal from 'sweetalert2';
import {User} from '../../../../../models/Use.model';
import {environment} from '../../../../../../environments/environment';

@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.component.html',
  styleUrls: ['./add-site.component.scss']
})
export class AddSiteComponent implements OnInit {
  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router) { }
  get f() { return this.AddSiteForm.controls; }
  AddSiteForm: FormGroup;
  loading = false;
  submitted = false;
  Longitude = 0;
  Latiude = 0;
  public CurrentUser1;
  AddSiteApiUrl = 'api/location/add';
  scope;
  map: mapboxgl.Map;
  AddSensorUrl = 'api/Sensor/Add';
  selected;
  states = ['tunis', 'ben Arouse', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia',
    'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
    'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
    'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
  SensorNameArray = ['tunis', 'ben Arouse', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia',
    'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
    'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
    'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
  public model: any;
  public model1: any;
  formatter = (result: string) => result.toUpperCase();
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.states.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  formatter1 = (result: string) => result.toUpperCase();
  search1 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.SensorNameArray.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  ngOnInit() {
    this.AddSiteForm = this.formBuilder.group({
      SiteName: ['', Validators.required],
      Description: ['', [Validators.maxLength(255)]],
    });
    (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
    if (mapboxgl.getRTLTextPluginStatus() !== 'loaded' ) {
      mapboxgl.setRTLTextPlugin(
        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
        null,
        true // Lazy load the plugin
      );
    }
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
    const el = new mapboxgl.Marker();
    this.map.addControl(language);
    this.map.on('click', hello => {
                                   this.Longitude = hello.lngLat.lng;
                                   this.Latiude = hello.lngLat.lat;
                                   el.setLngLat([hello.lngLat.lng, hello.lngLat.lat])
        .addTo(this.map);
    });
  }
  onSubmit() {
    console.log('on click');
    this.submitted = true;
    if (this.Longitude === 0 && this.Latiude === 0 ) {
      Swal.fire(
        'warning !',
        'You need To Select a location',
        'warning'
      );
      return ;
    }
    if (this.AddSiteForm.valid) {
      const options = {
        params: new HttpParams().append('token', localStorage.getItem('token'))
      };
      this.http.post(this.AddSiteApiUrl,
        {
          SiteName : this.AddSiteForm.get('SiteName').value,
          Coordinates : [this.Longitude, this.Latiude],
          Description : this.AddSiteForm.get('Description').value,
        }, options).subscribe(data => {
        console.log(data);
        const resSTR = JSON.stringify(data);
        const resJSON = JSON.parse(resSTR);
        console.log(resJSON.token);
        if (resJSON.status === 'ok') {
          Swal.fire(
            'Success !',
            resJSON.message,
            'success'
          );
          // localStorage.removeItem('currentUser');
          this.CurrentUser1 = new User();
          this.CurrentUser1.id = resJSON.UserData._id;
          this.CurrentUser1.FirstName = resJSON.UserData.FirstName;
          this.CurrentUser1.LastName = resJSON.UserData.LastName;
          this.CurrentUser1.email = resJSON.UserData.email;
          this.CurrentUser1.createdate = resJSON.UserData.Created_date;
          this.CurrentUser1.locationIds = resJSON.UserData.Location_ids;
          localStorage.setItem('currentUser', JSON.stringify(this.CurrentUser1));
          this.router.navigate(['/dashboard']);
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
    }

  }

}
