import { Component, OnInit } from '@angular/core';
import {Location} from '../../../../../models/Location.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import Swal from 'sweetalert2';
import * as mapboxgl from 'mapbox-gl';
import {environment} from '../../../../../../environments/environment';
import * as MapboxLanguage from '@mapbox/mapbox-gl-language';
import {Sensor} from '../../../../../models/Sensor.model';

@Component({
  selector: 'app-show-sensor',
  templateUrl: './show-sensor.component.html',
  styleUrls: ['./show-sensor.component.scss']
})
export class ShowSensorComponent implements OnInit {
  private SensorsApiUrl = 'api/sensors/';
  private NumbTemperature = 0;

  constructor( private http: HttpClient) { }
  public locations: Array<Location> = [];
  public Sensors: Array<Sensor> = [];
  private CurrentUser: any;
  map: mapboxgl.Map;
  Longitude = 0;
  Latiude = 0;
  public em = new mapboxgl.Marker({color: 'red'});
  NumbHumidity = 0;
  ngOnInit() {
    this.load_data();
  }
  async load_data(): Promise<Array<Location>> {
    const options = {
      params: new HttpParams().append('token', localStorage.getItem('token'))
    };
    await this.http.get(this.SensorsApiUrl, options).subscribe(data => {
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
        });
        resJSON.Sensors.forEach((item1) => {
          const sens = new Sensor();
          sens.Name = item1.name;
          sens.SensorType = item1.SensorType;
          sens.SensorCoordinates = item1.SensorCoordinates;
          sens.Description = item1.Description;
          sens.id = item1._id;
          sens.createdate = item1.Created_date;
          this.Sensors.push(sens);
        });
        this.small_stats(this.Sensors);
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
    console.log(this.Sensors);
    console.log(this.locations);
    this.add_map();
    return this.locations;
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
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 9,
      center: [10.196506147691451 , 36.792635314317465],
    });
    // Add map controls
    this.map.addControl(new mapboxgl.NavigationControl() );
    const language = new MapboxLanguage({
      defaultLanguage: 'en'
    });
    this.map.addControl(language);
    console.log('map loaded');
    // {color: 'red'}
  }
  small_stats(Sens) {
    Sens.forEach((item) => {
      if (item.SensorType === 'Temperature') {
        this.NumbTemperature = this.NumbTemperature + 1;
      }
      if (item.SensorType === 'humidity') {
        this.NumbHumidity = this.NumbHumidity + 1;
      }
    });
    console.log(this.NumbHumidity);
    console.log(this.NumbTemperature);
    this.loadSensorMarkers(this.map);
  }
  loadSensorMarkers(map) {
    this.map.on('load', () => {
// Add a new source from our GeoJSON data and
// set the 'cluster' option to true. GL-JS will
// add the point_count property to your source data.
      this.map.addSource('earthquakes', {
        type: 'geojson',
// Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
// from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data : '/api/sensors/geoMap' + '?token=' + localStorage.getItem('token'),
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });

      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        paint: {
// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
// with three steps to implement three types of circles:
//   * Blue, 20px circles when point count is less than 100
//   * Yellow, 30px circles when point count is between 100 and 750
//   * Pink, 40px circles when point count is greater than or equal to 750
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10,
            30,
            75,
            40
          ]
        }
      });

      this.map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      this.map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#641E16',
          'circle-radius': 5,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

// inspect a cluster on click
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('earthquakes').getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) { return; }

            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom
            });
          }
        );
      });

// When a click event occurs on a feature in
// the unclustered-point layer, open a popup at
// the location of the feature, with
// description HTML from its properties.
      this.map.on('click', 'unclustered-point', (e) => {

        // @ts-ignore
        const coordinates = e.features[0].geometry.coordinates.slice();
        const SensorType = e.features[0].properties.SensorType;
        const name = e.features[0].properties.name;

// Ensure that if the map is zoomed out such that
// multiple copies of the feature are visible, the
// popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML('SensorType: ' + SensorType  + '<br>Name: ' + name)
          .addTo(map);
      });

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
      });
    });
  }

}
