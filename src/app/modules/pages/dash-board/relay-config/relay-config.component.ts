import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {PageService} from '../../../pages/pages/page.service';
import {Sensor} from '../../../../models/Sensor.model';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import Swal from 'sweetalert2';
import {DashboardService} from '../dashboard.service';
@Component({
  selector: 'app-relay-config',
  templateUrl: './relay-config.component.html',
  styleUrls: ['./relay-config.component.scss']
})
export class RelayConfigComponent implements OnInit , OnDestroy {
  Loaded = false;
  private ChartTab = [];
  private Relays: Array<Sensor> = [];
  private Sensors: Array<Sensor> = [];
  checked;
  message: string;
  date: Date = new Date();
  date1: Date = new Date();
  currentmessage;
  dropdownList = [];
  selectedItems = [];
  NotificationSelections = [];
  RelayConfiguration = [];
  RelaydropdownList = [];
  RelayselectedItems = [];
  // dropdownSettings = {};
  dropdownSettings: IDropdownSettings;
  RelaydropdownSettings: IDropdownSettings;
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
  constructor(private pageService: PageService, private ref: ChangeDetectorRef , private dasheService: DashboardService) { }

  ngOnInit() {
    this.dropdownList = [
      { item_id: 1, item_text: 'Email' },
      { item_id: 2, item_text: 'Puch Notification' },
      { item_id: 3, item_text: 'SMS' }
    ];
    this.selectedItems = [
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.RelaydropdownList = [
      { item_id: 1, item_text: 'Email' },
      { item_id: 2, item_text: 'Puch Notification' },
      { item_id: 3, item_text: 'SMS' }
    ];
    this.RelayselectedItems = [
    ];
    this.RelaydropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.pageService.currentMessage.subscribe(message => {
      this.message = message;
      console.log('message from relay data' , message);
      if (this.message !== 'none' && this.message !== 'none here') {
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
    });
  }
  ngOnDestroy() {
    // console.log('relayconfig destroyed for ', this.message);
    this.pageService.RefrechPage(true);
  }
  async load_data() {
    this.ChartTab = [];
    await this.pageService.currentRelayMessage.subscribe(data => {
      this.ChartTab = data.chartTab;
      this.Relays = data.Relays;
      this.Sensors = data.sensors;
      this.Loaded = true;
    });
    this.RelaydropdownList = [
    ];
    this.Relays.forEach(item => {
      // console.log('item :', item);
      this.RelaydropdownList.push({ item_id : item.id , item_text : item.Name});
    });
    this.ref.detectChanges();
  }
  AutoFunction() {
    // console.log('checkbox triggerd', this.checked);
    this.pageService.changeIrrigationState(localStorage.getItem('token'), this.checked, this.message);
  }
  onItemSelect(item: any, sensor: Sensor) {
    // console.log(item);
    // console.log('Notification Selection' , this.NotificationSelections.toString());
    this.NotificationSelections.forEach( it => console.log('Notification selection item ', it ));
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onNotifSelect(item: any, sensor: Sensor) {
    console.log('on notif selection ', this.NotificationSelections);
    if (this.NotificationSelections.length === 0 || !(this.NotificationSelections.find(i => i.sensorId === sensor.id))) {
      console.log('NotificationSelections is empty');
      const x: any = {};
      x.sensorId = sensor.id;
      x.NotifSelection = [];
      x.RelaySelection = [];
      x.NotifSelection.push(item);
      this.NotificationSelections.push(x);
    } else {
      console.log('NotificationSelections not empty');
      this.NotificationSelections.forEach(it => {
        if (it.sensorId === sensor.id) {
          let i = 0;
          let exist = false;
          for (i ; i < it.NotifSelection.length ; i++) {
            if (it.NotifSelection[i].item_id === item.item_id) {
              console.log('exists splicing now');
              it.NotifSelection.splice(i, 1 );
              exist = true;
            }
          }
          if (exist === false) {
            console.log('adding new intry to NotifSelection');
            it.NotifSelection.push(item);
            return ;
          }
        }
      });
    }
    console.log('end notif selection ', this.NotificationSelections);
  }
  updateIrrigation() {
    // console.log('selectedItems' , this.selectedItems.toString());
  }

  StartIrrigation() {// get all data from html
    if (this.RelayConfiguration === undefined || this.RelayConfiguration.length === 0 ) {
      return ;
    }
    this.dasheService.SendRelayConfig(this.RelayConfiguration).subscribe(data => {
        const resSTR = JSON.stringify(data);
        const resJSON = JSON.parse(resSTR);
        console.log(resJSON);
        if (resJSON.status === 'ok') {
          Swal.fire({
            icon: 'success',
            title: 'Saved',
            text: resJSON.message,
          });
        }
      }
      );
  }

  SaveIrrigation(sensor: Sensor, dateElement: any , Mode: any , Tmax: any , Tmin: any) {
    console.log('save Sensor ' , sensor.Name , sensor.id , dateElement, this.NotificationSelections , Mode , Tmax , Tmin);
    if (Tmax < Tmin) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'TMin Cannot be greater than TMax',
      });
      return ;
    }
    if (dateElement === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please Choose a Date',
      });
      return;
    }
    const x: any = {};
    x.SensorId = sensor.id;
    x.date = dateElement;
    x.Mode = Mode;
    x.TMax = Tmax;
    x.TMin = Tmin;
    // console.log('NotificationSelections' , this.NotificationSelections);
    this.NotificationSelections.forEach(item => {
      console.log('item : ', item);
      if (x.SensorId === item.sensorId) {
          x.NotifSelection = item.NotifSelection;
          x.RelaySelection = item.RelaySelection;
      }
    });
    let found = false;
    found = this.RelayConfiguration.find(job => job.SensorId === x.SensorId);
    if ( ! found) {
      this.RelayConfiguration.push(x);
    }
    this.dasheService.SaveIrrigationRules(sensor.id , this.RelayConfiguration).subscribe(data => {
        const resSTR = JSON.stringify(data);
        const resJSON = JSON.parse(resSTR);
        console.log(resJSON);
        if (resJSON.status === 'ok') {
          Swal.fire({
            icon: 'success',
            title: 'Saved',
            text: resJSON.message,
          });
        }
        if (resJSON.status === 'err') {
        Swal.fire({
          icon: 'error',
          title: 'Error Saving Rules',
          text: resJSON.message,
        });
      }
      }
    );
    this.RelayConfiguration = [];
    console.log('final Object' , this.RelayConfiguration);
    Swal.fire({
      icon: 'info',
      title: 'saved',
      text: 'Shedule Saved',
    });
  }

  onNotifAll(item: any, sensor: Sensor) {
    // console.log('on onNotifAll');
  }

  onRelaySelect(item: any, sensor: Sensor ) {
    console.log('on relay selection ', this.NotificationSelections);
    if (this.NotificationSelections.length === 0) {
      const x: any = {};
      x.sensorId = sensor.id;
      x.NotifSelection = [];
      x.RelaySelection = [];
      x.RelaySelection.push(item);
      this.NotificationSelections.push(x);
    } else {
      this.NotificationSelections.forEach(it => {
        if (it.sensorId === sensor.id) {
          let i = 0;
          let exist = false;
          for (i; i < it.RelaySelection.length ; i++) {
            if (it.RelaySelection[i].item_id === item.item_id) {
              it.RelaySelection.splice(i, 1 );
              exist = true;
            }
          }
          if (exist === false) {
            it.RelaySelection.push(item);
          }
        } else {
          const x: any = {};
          x.sensorId = sensor.id;
          x.NotifSelection = [];
          x.RelaySelection = [];
          x.RelaySelection.push(item);
          this.NotificationSelections.push(x);
        }
      });
    }
    console.log('end relay selection ', this.NotificationSelections);
  }
}
