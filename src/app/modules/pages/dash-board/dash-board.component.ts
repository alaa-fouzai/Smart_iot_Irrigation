import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import { UserService} from '../../../services/user.service';
import { Injectable } from '@angular/core';
import {User} from '../../../models/Use.model';
import {Router} from '@angular/router';
import {PageService} from '../pages/page.service';
import {Location} from '../../../models/Location.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Sensor} from '../../../models/Sensor.model';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import * as io from 'socket.io-client';
@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.scss']
})
export class DashBoardComponent implements OnInit , OnDestroy {
  CurrentUser = new User();
  private SensorsApiUrl = '/api/dashboard/SensorsData';
  private WeitherApiUrl = '/api/dashboard/weither';
  private socket = io('http://localhost:3000/dashboard/IrrigationState');
  private Sensors: Array<Sensor> = [];
  Loaded = false;
  weitherLoaded = false;
  LocationName = '';
  weitherData;
  weitherData1 = [];
  checked;
  private CurrentLocation: Location;
  private ChartTab = [];
  Chartab = {};
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
    {data: [5, 8, 2, 5, 5, 4], label: 'temperature'},
    {data: [65, 45, 45, 87, 9, 78], label: 'humidity'}
  ];
  BarChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    backgroundColor: [
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
  BarChartLegend = true;

  constructor(private router: Router, private pageServise: PageService, private http: HttpClient, private ref: ChangeDetectorRef) {
  }
  ngOnDestroy() {
    console.log('on destroy');
    this.ChartTab = [];
    this.pageServise.changeMessage('none');
  }
  ngOnInit() {
    // this.socket.join();
    this.weitherLoaded = false;
    this.CurrentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.ChartTab = [];
    this.pageServise.currentMessage.subscribe(message => {
      this.message = message;
      if (this.message !== 'none') {
        this.load_data();
        this.load_weither();
        this.pageServise.IrrigationState(localStorage.getItem('token'), this.message);
        this.pageServise.ChartUpdatefunction(localStorage.getItem('token'), this.message);
      }
    });
    this.pageServise.AutomaticIrrigation.subscribe(message => {
      console.log('IrrigationService', message);
      this.checked = message;
    });
    this.chartsUpdate();
  }

  async load_data() {
    this.Sensors = [];
    let param = this.message;
    if (this.message === 'none here') {
      // @ts-ignore
      param = this.CurrentUser.locationIds[0];
    }
    const options = {

      params: new HttpParams().append('token', localStorage.getItem('token')).append('location_id', param)
    };
    await this.http.get(this.SensorsApiUrl, options).subscribe(data => {
      const resSTR = JSON.stringify(data);
      const resJSON = JSON.parse(resSTR);
      // console.log('CurrentLocation' , this.CurrentLocation);
      if (resJSON.status === 'ok') {
        this.CurrentLocation = resJSON.location;
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
        this.pageServise.CurrentLocationData(this.CurrentLocation);
        this.data_process(this.Sensors);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: resJSON.message,
        });
        return;
      }
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
      return;
    });
    return this.Sensors;
  }

  data_process(Sens) {
    this.ChartTab = [];
    console.log('sensors ', Sens);
    Sens.forEach(item => {
      const temp = [];
      const hum = [];
      const humNominal = [];
      const tempNominal = [];
      const labels = [];
      let batt;
      let lT;
      item.data.forEach(item1 => {
          temp.push(item1.temperature);
          hum.push(item1.humidite);
          humNominal.push(10);
          tempNominal.push(30);
          const date = new Date(item1.time);
          let min;
          date.getMinutes() > 10 ? (min = date.getMinutes()) : min = '0' + date.getMinutes();
          labels.push(date.getHours() + ':' + min + ' ');
          batt = item1.batterie;
          lT = date.getHours() + ':' + min + ' ' + date.getDate() + '/' + date.getMonth() +
            '/' + date.getFullYear();
        }
      );
      let BarChartData = [];
      BarChartData = [
        {data: temp, label: 'temperature', borderColor: 'rgba(243, 204, 6 , 1)', fill: false},
        {data: hum, label: 'humidité', borderColor: 'rgba(45, 243, 6, 1)', fill: false},
      ];
      this.ChartTab.push({
        SensorId: item.id,
        SensorData: BarChartData,
        SensorBattery: batt,
        SensorLastRead: lT,
        SensorLabel: labels,
        SensorName: item.Name
      });
      console.log('char data :', this.ChartTab);
    });
    this.Loaded = true;
    // this.addValueToChar();
  }

  private async load_weither() {
    const param = this.message;
    if (this.message === 'none here') {
      // @ts-ignore
      this.message = this.CurrentUser.locationIds[0];
    }
    const options = {

      params: new HttpParams().append('token', localStorage.getItem('token')).append('location_id', this.message)
    };
    await this.http.get(this.WeitherApiUrl, options).subscribe(data => {
      this.weitherLoaded = true;
      const resSTR = JSON.stringify(data);
      const resJSON = JSON.parse(resSTR);
      this.LocationName = resJSON.message.city.name + ' ,' + resJSON.message.city.country;
      this.weitherData = resJSON.message;
      // console.log('weither data', this.weitherData);
      let currentDay = 0;
      let i = 0;
      let weither: any = {};
      let weitherByTime = [];
      this.weitherData1 = [];
      this.weitherData.list.forEach((item) => {
          // console.log('item', item);
          const date = new Date(item.dt * 1000).getDate();
          // console.log('date ', date);
          const x: any = {};
          x.temp = item.main.temp;
          x.temp_max = item.main.temp_max;
          x.temp_min = item.main.temp_min;
          x.hum = item.main.humidity;
          x.time = new Date(item.dt * 1000).getHours();
          x.forcast = item.weather[0].main;
          weitherByTime.push(x);
          if (date !== currentDay) {
            weither.time = new Date(item.dt * 1000).toDateString();
            weither.data = weitherByTime;
            currentDay = date;
            this.weitherData1.push(weither);
            weither = {};
            weitherByTime = [];
            i++;
          }
        }
      );
      // console.log('weither days', this.weitherData1);
      console.log('weither ', this.weitherData1);
      this.pageServise.WeitherData(this.weitherData1);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
    });
  }

  AutoFunction() {
    // console.log('checkbox triggerd', this.checked);
    this.pageServise.changeIrrigationState(localStorage.getItem('token'), this.checked, this.message);
  }

  SendMessage(text) {
    // console.log('emmiting socked');
    this.socket.emit('data', text);
  }
  /*SensorBattery: 90
  SensorData: Array(2)
  0: {data: Array(9), label: "temperature", borderColor: "rgba(243, 204, 6 , 1)", fill: false, backgroundColor: "rgba(255,99,132,0.4)", …}
  1: {data: Array(9), label: "humidité", borderColor: "rgba(45, 243, 6, 1)", fill: false, backgroundColor: "rgba(54,162,235,0.4)", …}
  length: 2
  __proto__: Array(0)
  SensorId: "5e5f714b343934062cf6d757"
  SensorLabel: Array(9)
  0: "6:27 "
  1: "6:28 "
  2: "6:35 "
  3: "6:35 "
  4: "6:36 "
  5: "16:08 "
  6: "16:13 "
  7: "19:57 "
  8: "20:01 "
  length: 9
  __proto__: Array(0)
  SensorLastRead: "20:01 14/4/2020"
  SensorName: "sensor 1"*/
  chartsUpdate() {
    this.pageServise.ChartUpdateValue.subscribe(item => {
      console.log('new chart data' , item.newData);
      console.log('new sens Id' , item.SensId);
      console.log('Chart data' , this.ChartTab);
      this.ChartTab.forEach( item1 => {
        console.log('item' , item1);
        if (item1.SensorId === item.SensId) {
          item1.SensorBattery = item.newData.batterie;
          item1.SensorData.forEach(item2 => {
            if (item2.label === 'temperature') {
              item2.data.push(item.newData.temperature);
            }
            if (item2.label === 'humidité') {
              item2.data.push(item.newData.humidite);
            }
          });
          const date = new Date(item.newData.time);
          let min;
          date.getMinutes() > 10 ? (min = date.getMinutes()) : min = '0' + date.getMinutes();
          item1.SensorLabel.push(date.getHours() + ':' + min + ' ');
          item1.SensorLastRead = date.getHours() + ':' + min + ' ' + date.getDate() + '/' + date.getMonth() +
            '/' + date.getFullYear();
        }
      });
      // this.ChartTab.SensorBattery = item.batterie;
    });
  }
  PassRelayData() {
    if (this.Loaded) {
       this.pageServise.RelayData(this.ChartTab);
    }
  }
}
