import { Component, OnInit } from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {User} from '../../../../../models/Use.model';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import {Observable} from 'rxjs';
import {Location} from '../../../../../models/Location.model';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxLanguage from '@mapbox/mapbox-gl-language';
import {environment} from '../../../../../../environments/environment';
import {iterator} from 'rxjs/internal-compatibility';
@Component({
  selector: 'app-show-sites',
  templateUrl: './show-sites.component.html',
  styleUrls: ['./show-sites.component.scss']
})
export class ShowSitesComponent implements OnInit {
  AddSiteApiUrl = 'api/location/';
  public locations: Array<Location> = [];
  map: mapboxgl.Map;
  constructor(private http: HttpClient) { }
  ngOnInit() {
    this.load_data();
  }
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
         this.show_map(this.locations);
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
     return this.locations;
   }
  show_map(locat) {
    const loc = locat;
    (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
    mapboxgl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
      null,
      true // Lazy load the plugin
    );
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v10',
      zoom: 8,
      center: [10.196506147691451 , 36.792635314317465],
    });
    // Add map controls
    this.map.addControl(new mapboxgl.NavigationControl() );
    const language = new MapboxLanguage({
      defaultLanguage: 'en'
    });
    this.map.addControl(language);
    console.log('locatios');
    console.log(loc.length);
    console.log(loc);
    loc.forEach(item => {
      const el = new mapboxgl.Marker();
      el.setLngLat([item.Coordinates[0], item.Coordinates[1]]).setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML('<h1>' + item.SiteName + '</h1><p>' + item.SensorIds.length + ' sensors ' + '</p>'))
        .addTo(this.map);
    });
  }
}
