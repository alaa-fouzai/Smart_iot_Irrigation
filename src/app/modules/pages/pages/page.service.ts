import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private messageSource = new BehaviorSubject<string>('none');
  currentMessage = this.messageSource.asObservable();
  private RelaySource = new BehaviorSubject<any>({});
  currentRelayMessage = this.RelaySource.asObservable();
  private dataSource = new BehaviorSubject<boolean>(false);
  AutomaticIrrigation = this.dataSource.asObservable();
  private ChartUpdateSource = new BehaviorSubject<any>({});
  ChartUpdateValue = this.ChartUpdateSource.asObservable();
  private CurrentLocationSource = new BehaviorSubject<string>('none');
  CurrentLocation = this.CurrentLocationSource.asObservable();
  private WeitherSource = new BehaviorSubject<any>({});
  Weither = this.WeitherSource.asObservable();
  irrigation = io.connect('http://localhost:3000/dashboard/IrrigationState');
  ChartUpdate = io.connect('http://localhost:3000/Sensor/UpdateValue');
  updateRequired = true;
  updateChartRequired = true;
  relayData;
  constructor() {
    // console.log('setting socket listener');
    this.ChartUpdate.on('setChartdata', (dataa) => {
      // console.log('getChartdata' , dataa);
      this.ChartUpdateSource.next(dataa);
    });
  }
  changeMessage(message: string) {
    this.messageSource.next(message);
    this.ChartUpdateSource.next(message);
    this.updateRequired = true ;
    this.updateChartRequired = true;
    console.log('update required true');
  }
  IrrigationState(token , locationId) {
      if (this.updateRequired) {
        this.irrigation.emit('getdata', {Accesstoken: token, LocationId: locationId});
        this.updateRequired = false;
        console.log('updated');
      }
  }
  ChartUpdatefunction(token , locationId) {
    console.log('updated Chart');
    if (this.updateChartRequired) {
      this.ChartUpdate.emit('getChartdata', {Accesstoken: token, LocationId: locationId});
      this.updateChartRequired = false;
      // this.ChartUpdate.disconnect();
      console.log('updated Chart');
    }
  }
  changeIrrigationState(token , param , locationId) {
      this.irrigation.emit('changedata', { NewState : param , Accesstoken : token , LocationId : locationId});
  }
  RelayData(ChartData) {
    this.RelaySource.next(ChartData);
    this.updateRequired = true ;
    console.log('update required true');
  }
  CurrentLocationData(CurrentLocation) {
    this.CurrentLocationSource.next(CurrentLocation);
    this.updateRequired = true ;
    console.log('update CurrentLocation required true');
  }
  WeitherData(Weither) {
    this.WeitherSource.next(Weither);
    this.updateRequired = true ;
    console.log('update Weither required true');
  }
}
