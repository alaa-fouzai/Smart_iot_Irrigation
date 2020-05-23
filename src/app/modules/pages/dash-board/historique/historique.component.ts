import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Sensor} from '../../../../models/Sensor.model';
import {PageService} from '../../pages/page.service';
import {isEmpty} from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class HistoriqueComponent implements OnInit , OnDestroy {
  Loaded = false;
  private ChartTab1 = [];
  private ChartTab = [];
  private Relays: Array<Sensor> = [];
  checked;
  message: string;
  dateDebut: Date = new Date();
  dateFin: Date = new Date();
  private Temp = [];
  private Hum = [];
  currentSensorHistory;
  sensordata;
  finalsensordata;
  settings = {
    bigBanner: true,
    timePicker: true,
    format: 'hh:mm dd-MM-yyyy',
    defaultOpen: false,
    closeOnSelect : true
  };
  weitherData1 = [];
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
  constructor(private pageService: PageService, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.pageService.currentMessage.subscribe(message => {
      this.message = message;
      console.log('message from relay data' , message);
      if (this.message !== 'none') {
        this.pageService.IrrigationState(localStorage.getItem('token'), this.message);
      }
    });
    this.load_data();
  }
  ngOnDestroy() {
    console.log('relayconfig destroyed for ', this.message);
    this.pageService.RefrechPage(true);
    this.currentSensorHistory.unsubscribe();
  }
  async load_data() {
    this.ChartTab = [];
    this.currentSensorHistory = await this.pageService.currenthistoryMessage.subscribe(da => {
      console.log('data', da);
      if (Object.keys(da).length === 0) {
        console.log('data undefined', da);
      } else {
        this.Loaded = true;
        this.sensordata = da;
        console.log('sensordata1', this.sensordata);
        this.data_process(da.Sensor);
      }
    });
    this.ref.detectChanges();
  }
  data_process(data) {
    this.ChartTab1 = [];
    this.ChartTab = [];
    console.log('data process', data);
    console.log('sensordata2', this.sensordata);
    const item = data;
    console.log('item', item);
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
        labels.push(date.getDate() + '/' + (date.getMonth() + 1) + ' ' + date.getHours() + ':' + min + ' ');
        batt = item1.batterie;
        lT = date.getHours() + ':' + min + ' ' + date.getDate() + '/' + date.getMonth() +
          '/' + date.getFullYear();
      }
    );
    let BarChartData = [];
    BarChartData = [
      {data: temp, label: 'temperature', borderColor: 'rgba(243, 204, 6 , 1)', fill: false},
    ];
    let BarChartData1 = [];
    BarChartData1 = [
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
    this.ChartTab1.push({
      SensorId: item.id,
      SensorData: BarChartData1,
      SensorBattery: batt,
      SensorLastRead: lT,
      SensorLabel: labels,
      SensorName: item.Name
    });
    console.log('char data :', this.ChartTab);
  }

  searchByDate() {
    console.log('sensordata 3 ', this.sensordata);
    const debut = new Date(this.dateDebut).getTime() ;
    const fin = new Date(this.dateFin).getTime() ;
    if (debut >= fin) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Time Interval is wrong ',
      });
      return ;
    }
    console.log('sensordata 4' , this.sensordata);
    const s = this.sensordata.Sensor ;
    if (Object.keys(this.ChartTab).length === 0) {
      console.log('data undefined', this.ChartTab);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Plz Refrech The page',
      });
    } else {
      // console.log('data is ok', this.ChartTab);
      let i = 0;
      const usefull = [];
      for (i = 0 ; i < s.data.length; i++) {
        if (s.data[i].time < debut || s.data[i].time > fin) {
          // sensor.data.splice(i, 1 );
        } else {
          usefull.push(s.data[i]);
        }
      }
      // s.data = usefull;
      console.log('usefull ', usefull);
      console.log('sensordata', this.sensordata);
      console.log('s ', s);
      const obj = { Name : s.Name , data : usefull};
      this.data_process(obj);
    }
  }
}
