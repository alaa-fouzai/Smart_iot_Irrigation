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
  irrigation = io.connect('http://localhost:3000/dashboard/IrrigationState');
  updateRequired = true;
  relayData;
  constructor() {
  }
  changeMessage(message: string) {
    this.messageSource.next(message);
    this.updateRequired = true ;
    console.log('update required true');
  }
  IrrigationState(token , locationId) {
      if (this.updateRequired) {
        this.irrigation.emit('getdata', {Accesstoken: token, LocationId: locationId});
        this.irrigation.on('getdata', (dataa) => {
          console.log(dataa);
          this.dataSource.next(dataa);
        });
        this.updateRequired = false;
        console.log('updated');
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
}
