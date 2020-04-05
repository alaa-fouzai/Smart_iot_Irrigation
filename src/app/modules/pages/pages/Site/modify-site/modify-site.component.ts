import { Component, OnInit } from '@angular/core';
import {Location} from '../../../../../models/Location.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import Swal from 'sweetalert2';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as mapboxgl from 'mapbox-gl';
import {environment} from '../../../../../../environments/environment';
import * as MapboxLanguage from '@mapbox/mapbox-gl-language';
@Component({
  selector: 'app-modify-site',
  templateUrl: './modify-site.component.html',
  styleUrls: ['./modify-site.component.scss']
})
export class ModifySiteComponent implements OnInit {
  public locations: Array<Location> = [];
  AddSiteApiUrl = 'api/location/';
  UpdateSiteApiUrl = 'api/location/update';
  ModifySiteForm: FormGroup;
  public el = new mapboxgl.Marker();
  i;
  map: mapboxgl.Map;
  private CurrentUser: any;
  private Latiude: number;
  private Longitude: number;
  constructor(private formBuilder: FormBuilder, private http: HttpClient) { }

  ngOnInit() {
    this.ModifySiteForm = this.formBuilder.group({
      SiteName: ['', Validators.required],
      Description: ['', [Validators.maxLength(255)]],
      Coordinates: ['', ],
    });
    this.load_data();
  }
  get f() { return this.ModifySiteForm.controls; }
  async load_data(): Promise<Array<Location>> {
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
    this.add_map();
    return this.locations;
  }
add_map() {
  this.CurrentUser = JSON.parse(localStorage.getItem('currentUser'));
  (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
  mapboxgl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
      null,
      true // Lazy load the plugin
    );
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
    this.el.setLngLat([hello.lngLat.lng, hello.lngLat.lat])
      .addTo(this.map);
  });

}
  onSubmit() {}
  addMarker(Longitude , Latiude) {
    console.log('marker');
    const el = new mapboxgl.Marker();
    el.setLngLat([Longitude, Latiude]).setPopup(new mapboxgl.Popup({ offset: 25 }).addTo(this.map));
  }

  LoadLoacation(loc: Location) {
    try {
      let longitu = 0;
      let latite = 0;
      // @ts-ignore
      longitu = loc.Coordinates[0];
      // @ts-ignore
      this.Longitude = loc.Coordinates[0];
      // @ts-ignore
      latite = loc.Coordinates[1];
      // @ts-ignore
      this.Latiude = loc.Coordinates[1];
      this.el.setLngLat([longitu, latite]).setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML('<h1>' + loc.SiteName + '</h1><p>' + loc.SensorIds.length + ' sensors ' + '</p>'))
        .addTo(this.map);
    } catch (e) {
      console.log(e);
    }
  }

  Update(value: string, value2: string, loc: Location) {
    if (!value) {
      console.log('no sitename');
    } else {
      loc.SiteName = value;
    }
    if (!value2) {
      console.log('no Description');
    } else {
      loc.Description = value2;
    }
    let long = 0;
    if (!this.Longitude) {
      console.log('Longitude');
      // @ts-ignore
      long = loc.Coordinates[0];
    } else {
      long  = this.Longitude;
    }
    let lat = 0;
    if (!this.Longitude) {
      console.log('Longitude');
      // @ts-ignore
      lat = loc.Coordinates[1];
    } else {
      lat  = this.Latiude;
    }
    console.log('here');
    const options = {
      params: new HttpParams().append('token', localStorage.getItem('token'))
    };
    this.http.post(this.UpdateSiteApiUrl,
      {
        id : loc.id,
        SiteName : loc.SiteName,
        Coordinates : [long, lat],
        Description : loc.Description,
      }, options).subscribe(data => {
      console.log(data);
      const resSTR = JSON.stringify(data);
      const resJSON = JSON.parse(resSTR);
      console.log(resJSON.token);
      console.log(loc.id);
      if (resJSON.status === 'ok') {
        Swal.fire(
          'Success !',
          resJSON.message,
          'success'
        );
          }
          });
  }
}
