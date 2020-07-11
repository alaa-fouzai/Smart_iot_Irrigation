import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import { UserService} from '../../../services/user.service';
import { Injectable } from '@angular/core';
import {User} from '../../../models/Use.model';
import {Router} from '@angular/router';
import {PageService} from '../pages/page.service';
import {Location} from '../../../models/Location.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Sensor} from '../../../models/Sensor.model';
import {DatePipe, PlatformLocation} from '@angular/common';
import Swal from 'sweetalert2';
import * as io from 'socket.io-client';
import {first, last, take} from 'rxjs/operators';
import {DashboardService} from './dashboard.service';
import {Relay} from '../../../models/Relay.model';
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
  private Relays: Array<Relay> = [];
  private History = [];
  Loaded = false;
  Reload = false;
  weitherLoaded = false;
  LocationName = '';
  weitherData;
  weitherData1 = [];
  weitherWidget = [];
  UVData = [];
  weitherdata;
  subscriber;
  checked;
  Schedule = 0;
  private CurrentLocation: Location;
  private ChartTab = [];
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
      'rgba(0,0,200,0.3)',
      'rgba(0,0,200,0.3)',
      'rgba(0,0,200,0.3)',
      'rgba(0,200,200,0.3)',
      'rgba(0,200,200,0.3)',
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

  constructor(private router: Router, private pageServise: PageService,
              private http: HttpClient, private ref: ChangeDetectorRef, private location: PlatformLocation,
              private dashboardService: DashboardService) {
  }
  ngOnDestroy() {
    console.log('on destroy');
    this.ChartTab = [];
    this.subscriber.unsubscribe();
    // this.pageServise.changeMessage('none');
  }
  ngOnInit() {
    this.initComponent();
    this.pageServise.RefrechNeeded.subscribe(data => {
      console.log('need new refrech now ');
    });
  }

  private async initComponent() {
    // this.socket.join();
    console.log('1 message', this.message);
    this.message = '';
    this.weitherLoaded = false;
    this.CurrentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.ChartTab = [];
    this.subscriber = await this.pageServise.currentMessage.subscribe(message => {
      this.message = message;
      console.log('/**************************************** message', this.message);
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
    this.Relays = [];
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
        this.Schedule = 0;
        this.CurrentLocation = resJSON.location;
        resJSON.response.forEach((item1) => {
          console.log('item', item1);
          if (item1.SensorType === 'Relay') {
            const relay = new Relay();
            relay.Name = item1.name;
            relay.RelayType = item1.SensorType;
            relay.RelayCoordinates = item1.SensorCoordinates;
            relay.Description = item1.Description;
            relay.id = item1._id;
            relay.data = item1.data;
            relay.createdate = item1.Created_date;
            relay.rule = item1.Rules;
            this.Relays.push(relay);
          } else {
          const sens = new Sensor();
          sens.Name = item1.name;
          sens.SensorType = item1.SensorType;
          sens.SensorCoordinates = item1.SensorCoordinates;
          sens.Description = item1.Description;
          sens.id = item1._id;
          sens.data = item1.data;
          sens.createdate = item1.Created_date;
          sens.RelayIds = item1.Realy_ids;
          item1.Rules.forEach((x) => {
            // console.log('rule ' , x);
            const r = {
              status : x.Status ,
              StartTime: x.StartTime,
              Tmax: x.Tmax,
              Tmin: x.Tmin,
              Notifications: x.Notifications,
              Realy_ids: x.Realy_ids
            };
            sens.rule.push(r);
            const h = sens.rule;
            // console.log('hhhhhhhhhhhhhhh', h );
          });
          // console.log('rule' , item1.Rules);
         // sens.rule.push(item1.Rules);
          this.Sensors.push(sens);
          }
        });
        console.log('relays' , this.Relays);
        this.pageServise.CurrentLocationData(this.CurrentLocation);
        this.data_process(this.Sensors);
        this.Sensors.forEach(item => {
          console.log('length ---------------', item.rule);
          if (item.rule !== undefined && item.rule.length > 0) {
            if (item.rule[item.rule.length - 1 ].status === true) {
              this.Schedule ++;
            }
          }
        });
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
      const humSol1 = [];
      const humSol2 = [];
      const humSol3 = [];
      const humSolMoy = [];
      const tempSol1 = [];
      const humNominal = [];
      const tempNominal = [];
      const labels = [];
      let BarChartData = [];
      let BarChartDataForDash = [];
      let batt;
      let lT;
      if (item.SensorType === 'CarteDeSol') {
        console.log('carte de sol detected'); /*batterie: 75
humdity1: 4.7
humdity2: 10.2
humdity3: 0.1
temperatureSol: 24.5
time: 1593612377308*/
        item.data.forEach(item1 => {
            humSol1.push(item1.humdity1);
            humSol2.push(item1.humdity2);
            humSol3.push(item1.humdity3);
            humSolMoy.push((item1.humdity1 + item1.humdity2 + item1.humdity3) / 3 );
            tempSol1.push(item1.temperatureSol );
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
        BarChartData = [
          {data: humSol1, label: 'humidité 1', borderColor: 'rgba(243, 204, 6 , 1)', fill: false},
          {data: humSol2, label: 'humidité 2', borderColor: 'rgba(0,0,200,0.3)', fill: false},
          {data: humSol3, label: 'humidité 3', borderColor: 'rgba(0,0,200,0.3)', fill: false},
          {data: humSolMoy, label: 'humidité Moyenne', borderColor: 'rgba(0,0,255,0.3)', fill: false},
          {data: tempSol1, label: 'Temperature Sol', borderColor: 'rgba(255,0,0,0.3)', fill: false},
        ];
        BarChartDataForDash = [
          {data: humSol1.slice(-25), label: 'humidité 1', borderColor: 'rgba(45, 243, 6, 1)', fill: false},
          {data: humSol2.slice(-25), label: 'humidité 2', borderColor: 'rgba(45, 243, 6, 1)', fill: false},
          {data: humSol3.slice(-25), label: 'humidité 3', borderColor: 'rgba(45, 243, 6, 1)', fill: false},
          {data: humSolMoy.slice(-25), label: 'humidité Moyenne', borderColor: 'rgba(145, 203, 6, 1)', fill: false},
          {data: tempSol1.slice(-25), label: 'Temperature Sol', borderColor: 'rgba(255,0,0,0.3)', fill: false},
        ];
      } else {
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
      BarChartData = [
        {data: temp, label: 'temperature', borderColor: 'rgba(243, 204, 6 , 1)', fill: false},
        {data: hum, label: 'humidité', borderColor: 'rgba(45, 243, 6, 1)', fill: false},
      ];
      BarChartDataForDash = [
        {data: temp.slice(-25), label: 'temperature', borderColor: 'rgba(243, 204, 6 , 1)', fill: false},
        {data: hum.slice(-25), label: 'humidité', borderColor: 'rgba(45, 243, 6, 1)', fill: false},
      ];
      }
      const labelForDash = labels.slice(-25);
      this.ChartTab.push({
        SensorId: item.id,
        SensorData: BarChartData,
        SensorDataForDash: BarChartDataForDash,
        SensorBattery: batt,
        SensorLastRead: lT,
        SensorLabel: labels,
        LabelForDash: labelForDash,
        SensorName: item.Name,
        SensorType: item.SensorType
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
    await this.http.get(this.WeitherApiUrl, options).subscribe(async data => {
      const resSTR = JSON.stringify(data);
      const resJSON = JSON.parse(resSTR);
      this.weitherdata = await this.dashboardService.ProcessWeitherdata(resJSON.message);
      this.weitherWidget = this.weitherdata.Widget;
      console.log('ultraviolet', resJSON.message.UVforcast);
      this.UVData = resJSON.message.UVforcast;
      this.LocationName = resJSON.message.weither.city.name + ' ,' + resJSON.message.weither.city.country;
      this.weitherData = resJSON.message.weither;
     /* console.log('weither data', this.weitherData);
      let currentDay = 0;
      let i = 0;
      let weither: any = {};
      let weitherByTime = [];
      this.weitherData1 = [];
      this.weitherData.list.forEach((item) => {
          // console.log('item', item);
          const date = new Date(item.dt * 1000).getDate();
          // console.log('date ', date);
          let uvdata = [];
          uvdata = this.UVData;
          const x: any = {};
          x.temp = item.main.temp;
          x.temp_max = item.main.temp_max;
          x.temp_min = item.main.temp_min;
          x.hum = item.main.humidity;
          x.time = new Date(item.dt * 1000).getHours();
          x.forcast = item.weather[0].main;
          let index;
          for (index = 0; index < 5 ; index++) {
            const dateuv = new Date(uvdata[index].date * 1000).getDate();
            const WeitherDate = new Date(item.dt * 1000).getDate();
            if (dateuv === WeitherDate) {
              /// console.log('found a match ' , WeitherDate , ' === ' , dateuv , 'data :' , uvdata[index].value);
              x.uv = uvdata[index].value;
            }
          }
          weitherByTime.push(x);
          /*
          uvdata.forEach(uv => {
            if (i > 4) {
              break;
            }
            // console.log('uv', uv.date);
            const dateuv = new Date(uv.date * 1000).getDay();
            const WeitherDate = new Date(item.dt * 1000).getDay();
            if (dateuv === WeitherDate) {
              console.log('found a match ' , WeitherDate , ' === ' , dateuv);
              x.uv = uv.value ;
            }
          });*//*
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
      );*/
      // console.log('weither days', this.weitherData1);
      // console.log('weither ', this.weitherData1);
      this.weitherLoaded = true;
      this.pageServise.WeitherData({widget : this.weitherdata.Widget , allWeither : this.weitherdata.allWeither});
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
      console.log('new chart data length ' , item.newData);
      console.log('new sens Id' , item.SensId);
      console.log('Chart data' , this.ChartTab);
      this.ChartTab.forEach( item1 => {
        console.log('item' , item1);
        if (item1.SensorId === item.SensId) {
          if (item1.SensorType === 'CarteDeSol') {
            console.log('Update Carte Sol');
            item1.SensorBattery = item.newData.batterie;
            item1.SensorData.forEach(item2 => {
              if (item2.label === 'humidité 1') {
                item2.data.push(item.newData.humdity1);
              }
              if (item2.label === 'humidité 2') {
                item2.data.push(item.newData.humdity2);
              }
              if (item2.label === 'humidité 3') {
                item2.data.push(item.newData.humdity3);
              }
              if (item2.label === 'Temperature Sol') {
                item2.data.push(item.newData.temperatureSol);
              }
              if (item2.label === 'humidité Moyenne') {
                item2.data.push((item.newData.humdity3 + item.newData.humdity2 + item.newData.humdity1) / 3);
              }
            });
            item1.SensorDataForDash.forEach(item2 => {
              if (item2.label === 'humidité 1') {
                item2.data.splice(0, 1 );
                item2.data.push(item.newData.humdity1);
              }
              if (item2.label === 'humidité 2') {
                item2.data.splice(0, 1 );
                item2.data.push(item.newData.humdity2);
              }
              if (item2.label === 'humidité 3') {
                item2.data.splice(0, 1 );
                item2.data.push(item.newData.humdity3);
              }
              if (item2.label === 'Temperature Sol') {
                item2.data.splice(0, 1 );
                item2.data.push(item.newData.temperatureSol);
              }
              if (item2.label === 'humidité Moyenne') {
                item2.data.splice(0, 1 );
                item2.data.push((item.newData.humdity3 + item.newData.humdity2 + item.newData.humdity1) / 3);
              }
            });
            const date = new Date(item.newData.time);
            let min;
            date.getMinutes() > 10 ? (min = date.getMinutes()) : min = '0' + date.getMinutes();
            item1.SensorLabel.push(date.getHours() + ':' + min + ' ');
            item1.LabelForDash.splice(0 , 1 );
            item1.LabelForDash.push(date.getHours() + ':' + min + ' ');
            item1.SensorLastRead = date.getHours() + ':' + min + ' ' + date.getDate() + '/' + date.getMonth() +
              '/' + date.getFullYear();
          } else {
            item1.SensorBattery = item.newData.batterie;
            item1.SensorData.forEach(item2 => {
              if (item2.label === 'temperature') {
                item2.data.push(item.newData.temperature);
              }
              if (item2.label === 'humidité') {
                item2.data.push(item.newData.humidite);
              }
            });
            item1.SensorDataForDash.forEach(item2 => {
              if (item2.label === 'temperature') {
                item2.data.splice(0, 1 );
                item2.data.push(item.newData.temperature);
              }
              if (item2.label === 'humidité') {
                item2.data.splice(0, 1 );
                item2.data.push(item.newData.humidite);
              }
            });
            const date = new Date(item.newData.time);
            let min;
            date.getMinutes() > 10 ? (min = date.getMinutes()) : min = '0' + date.getMinutes();
            item1.SensorLabel.push(date.getHours() + ':' + min + ' ');
            item1.LabelForDash.splice(0 , 1 );
            item1.LabelForDash.push(date.getHours() + ':' + min + ' ');
            item1.SensorLastRead = date.getHours() + ':' + min + ' ' + date.getDate() + '/' + date.getMonth() +
              '/' + date.getFullYear();
          }
        }
      });
      // this.ChartTab.SensorBattery = item.batterie;
    });
  }
  PassRelayData() {
    if (this.Loaded) {
       this.pageServise.RelayData({chartTab : this.ChartTab , Relays : this.Relays , sensors : this.Sensors});
    }
  }

  passHistoryData(chart) {
    if (this.Loaded) {
      console.log('sensors for history ', this.Sensors);
      console.log('chart for history ', chart.SensorId);
      this.Sensors.forEach(item => {
        if (chart.SensorId === item.id) {
          this.pageServise.HistoryData({Sensor : item});
          return;
        }
      });
    }
  }
}
