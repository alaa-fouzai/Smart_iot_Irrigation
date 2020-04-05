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
  public Sensors: Array<Sensor> = [];
  Loaded = false;
  public dataaa = [];
  message: string;
  color = 'primary';
  mode = 'determinate';
  value = 50;
  bufferValue = 75;
  BarChartData = [
    { data : [65 , 68 , 62 , 65 , 25 , 54], label: 'temperature'},
    { data : [65 , 45 , 45 , 87 , 9 , 78], label: 'humidity'}
  ] ;
  BarChartData1 = [
    { data : [5 , 8 , 2 , 5 , 5 , 4], label: 'temperature'},
    { data : [65 , 45 , 45 , 87 , 9 , 78], label: 'humidity'}
  ] ;
  BarChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
  };
  BarChartLabels = ['2016', '2017', '2018' , '2019' , '2020' ];
  BarChartType = 'bar';
  BarChartLegend = true ;
  constructor(private router: Router, private pageServise: PageService , private http: HttpClient , private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.CurrentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.pageServise.currentMessage.subscribe(message => {this.message = message;
                                                          if (this.message !== 'none') {
        this.load_data();
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
    console.log('data process -------------');
    this.dataaa = [];
    const temp = [];
    Sens.forEach(item => {
      console.log(item.data);
      item.data.forEach(item1 => { temp.push(item1.temperature); } );
      let BarChartData;
      BarChartData = [
        { data : temp , label: item.SensorType},
      ] ;
      this.dataaa.push(BarChartData);
    });
    console.log('End data process -------------');
    this.Loaded = true;
    this.ref.detectChanges();
  }

}
