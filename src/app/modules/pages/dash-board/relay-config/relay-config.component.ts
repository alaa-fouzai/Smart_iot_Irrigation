import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {PageService} from '../../../pages/pages/page.service';
import {Sensor} from '../../../../models/Sensor.model';

@Component({
  selector: 'app-relay-config',
  templateUrl: './relay-config.component.html',
  styleUrls: ['./relay-config.component.scss']
})
export class RelayConfigComponent implements OnInit , OnDestroy {
  Loaded = false;
  private ChartTab = [];
  private Relays: Array<Sensor> = [];
  checked;
  message: string;
  date: Date = new Date();
  date1: Date = new Date();
  currentmessage;
  settings = {
    bigBanner: true,
    timePicker: true,
    format: 'hh:mm dd-MM-yyyy',
    defaultOpen: false,
    closeOnSelect : false
  };
  allWeitherData;
  wetherWidget;
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
  CurrentLocation: any;
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
    this.pageService.CurrentLocation.subscribe(message => {
      this.CurrentLocation = message;
    });
    this.pageService.Weither.subscribe(message => {
      this.allWeitherData = message.allWeither;
      this.wetherWidget = message.widget;
      console.log('weither data', message);
      console.log('allWeitherData ', this.allWeitherData);
    });
  }
  ngOnDestroy() {
    console.log('relayconfig destroyed for ', this.message);
    this.pageService.RefrechPage(true);
  }
  async load_data() {
    this.ChartTab = [];
    await this.pageService.currentRelayMessage.subscribe(data => {
      this.ChartTab = data.chartTab;
      this.Relays = data.Relays;
      this.Loaded = true;
      console.log('pageService :', this.ChartTab);
    });
    console.log('pageService :', this.ChartTab);
    this.ref.detectChanges();
  }
  AutoFunction() {
    // console.log('checkbox triggerd', this.checked);
    this.pageService.changeIrrigationState(localStorage.getItem('token'), this.checked, this.message);
  }

}
