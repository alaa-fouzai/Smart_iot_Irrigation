import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {environment} from '../../../../../../environments/environment';
import {Location} from '../../../../../models/Location.model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HttpClient, HttpParams} from '@angular/common/http';
import * as MapboxLanguage from '@mapbox/mapbox-gl-language';
import {Sensor} from '../../../../../models/Sensor.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modify-sensor',
  templateUrl: './modify-sensor.component.html',
  styleUrls: ['./modify-sensor.component.scss']
})
export class ModifySensorComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private http: HttpClient , private ref: ChangeDetectorRef) { }
  public locations: Array<Location> = [];
  public sensors: Array<Sensor> = [];
  AddSiteApiUrl = '/api/sensors';
  UpdateSiteApiUrl = 'api/location/update';
  ModifySiteForm: FormGroup;
  public el = new mapboxgl.Marker();
  i;
  Loaded = false;
  map: mapboxgl.Map;
  private CurrentUser: any;
  private Latiude: number;
  private Longitude: number;
  item: any;
  ngOnInit() {
    this.add_map();
    this.load_data();
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
}
