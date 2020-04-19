import {Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { UserService} from '../../../services/user.service';
import { Injectable } from '@angular/core';
import {User} from '../../../models/Use.model';
import {Router} from '@angular/router';
import {PageService} from '../../../modules/pages/pages/page.service';
import {Location} from '../../../models/Location.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Sensor} from '../../../models/Sensor.model';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.scss']
})
export class DashBoardComponent implements OnInit {
  CurrentUser = new User();
  private SensorsApiUrl = '/api/dashboard/SensorsData';
  private WeitherApiUrl = '/api/dashboard/weither';
  public Sensors: Array<Sensor> = [];
  Loaded = false;
  weitherLoaded = false;
  LocationName = '';
  weitherData;
  public dataaa = [];
  public Batterys = [];
  public lastReadTime = [];
  public BarChartLabels = [];
  message: string;
  color = 'primary';
  mode = 'determinate';
  value = 50;
  bufferValue = 75;
  /*BarChartData = [
    { data : [65 , 68 , 62 , 65 , 25 , 54], label: 'temperature'},
    { data : [65 , 45 , 45 , 87 , 9 , 78], label: 'humidity'}
  ] ;*/
  BarChartData1 = [
    { data : [5 , 8 , 2 , 5 , 5 , 4], label: 'temperature'},
    { data : [65 , 45 , 45 , 87 , 9 , 78], label: 'humidity'}
  ] ;
  BarChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    backgroundColor : [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)'
    ],
    borderColor: [
      'rgba(1, 1, 1, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(1, 1, 1, 1)'
    ],
  };
  // BarChartLabels = ['2016', '2017', '2018' , '2019' , '2020' ];
  BarChartType = 'line';
  BarChartLegend = true ;
  constructor(private router: Router, private pageServise: PageService , private http: HttpClient , private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.weitherLoaded = false;
    this.CurrentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.pageServise.currentMessage.subscribe(message => {this.message = message;
                                                          if (this.message !== 'none') {
        this.load_data();
        this.load_weither();
      }});
    console.log('-----------------------------');
    console.log(this.message);
      }
  async load_data() {
    this.Sensors = [];
    console.log(this.message);
    let param = this.message;
    if (this.message === 'none here') {
      // @ts-ignore
      param = this.CurrentUser.locationIds[0];
    }
    const options = {

      params: new HttpParams().append('token', localStorage.getItem('token')).append('location_id', param )
    };
    await this.http.get(this.SensorsApiUrl, options).subscribe(data => {
      const resSTR = JSON.stringify(data);
      const resJSON = JSON.parse(resSTR);
      if (resJSON.status === 'ok') {
        resJSON.response.forEach((item1) => {
          const sens = new Sensor();
          sens.Name = item1.name;
          sens.SensorType = item1.SensorType;
          sens.SensorCoordinates = item1.SensorCoordinates;
          sens.Description = item1.Description;
          sens.id = item1._id;
          sens.data = item1.data;
          sens.createdate = item1.Created_date;
          this.Sensors.push(sens);
        });
        this.data_process(this.Sensors);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: resJSON.message,
        });
        console.log(resJSON.response);
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
    return this.Sensors;
  }
  data_process(Sens) {
    console.log('data process -------------', Sens);
    this.dataaa = [];
    this.BarChartLabels = [];
    this.Batterys = [];
    this.lastReadTime = [];
    Sens.forEach(item => {
      const temp = [];
      const hum = [];
      const humNominal = [];
      const tempNominal = [];
      const labels = [];
      let batt;
      let lT;
      item.data.forEach(item1 => {temp.push(item1.temperature); hum.push(item1.humidite ); humNominal.push(10) ;
                                  tempNominal.push(30);
                                  const date = new Date(item1.time) ;
                                  let min ;
                                  date.getMinutes() > 10 ? (min = date.getMinutes()) : min = '0' + date.getMinutes();
                                  labels.push(date.getHours() + ':' + min + ' ');
                                  batt = item1.batterie ;
                                  lT = date.getHours() + ':' + min + ' ' + date.getDate() + '/' + date.getMonth() +
                                    '/' + date.getFullYear(); } );
      let BarChartData = [];
      BarChartData = [
        { data : temp , label: 'temperature' , borderColor : 'rgba(243, 204, 6 , 1)' , fill : false },
        { data : hum , label: 'humidité'  , borderColor : 'rgba(45, 243, 6, 1)' , fill : false },
        { data : tempNominal , label: 'Temperaure Optimale', borderColor : 'rgba(255, 90, 90, 0.8)' , fill : false },
        { data : humNominal , label: 'Humidite Optimale', borderColor : 'rgba(90, 90, 255, 1)' , fill : false },
      ];
      this.dataaa.push(BarChartData);
      this.BarChartLabels.push(labels);
      // const batt = item.data[item.data.length].batterie;
      this.Batterys.push(batt);
      this.lastReadTime.push(lT);
    });
    console.log('battery', this.Batterys);
    console.log('time', this.lastReadTime);
    console.log('End data process -------------');
    this.Loaded = true;
    this.ref.detectChanges();
  }

  private async load_weither() {
    console.log('load weither');
    let param = this.message;
    if (this.message === 'none here') {
      // @ts-ignore
      param = this.CurrentUser.locationIds[0];
    }
    const options = {

      params: new HttpParams().append('token', localStorage.getItem('token')).append('location_id', param)
    };
    await this.http.get(this.WeitherApiUrl, options).subscribe(data => {
      this.weitherLoaded = true;
      const resSTR = JSON.stringify(data);
      const resJSON = JSON.parse(resSTR);
      console.log('------> weither data', resJSON.message);
      this.LocationName = resJSON.message.city.name + ' ,' + resJSON.message.city.country;
      this.weitherData = resJSON.message;
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
