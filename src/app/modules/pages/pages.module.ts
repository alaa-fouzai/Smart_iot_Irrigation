import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PagesRoutingModule} from './pages-routing.module';
import {PagesComponent} from './pages/pages.component';
import {DashBoardComponent} from './dash-board/dash-board.component';
import {LayoutModule} from '../layout/layout.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AddSiteComponent } from './pages/Site/add-site/add-site.component';
import {AgmCoreModule} from '@agm/core';
import { ShowSitesComponent } from './pages/Site/show-sites/show-sites.component';
import { RemouveSiteComponent } from './pages/Site/remouve-site/remouve-site.component';
import { ModifySiteComponent } from './pages/Site/modify-site/modify-site.component';
import {AddSensorComponent} from './pages/Sensor/add-sensor/add-sensor.component';
import { ShowSensorComponent } from './pages/Sensor/show-sensor/show-sensor.component';
import { RemouveSensorComponent } from './pages/Sensor/remouve-sensor/remouve-sensor.component';
import { ModifySensorComponent } from './pages/Sensor/modify-sensor/modify-sensor.component';
import { ChartsModule } from 'ng2-charts';
import { RelayConfigComponent } from './dash-board/relay-config/relay-config.component';
import {AngularDateTimePickerModule} from 'angular2-datetimepicker';
import { HistoriqueComponent } from './dash-board/historique/historique.component';
import {ProfileComponent} from './dash-board/profile/profile.component';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';


@NgModule({
  declarations: [PagesComponent, DashBoardComponent, AddSensorComponent,
    AddSiteComponent, ShowSitesComponent, RemouveSiteComponent, ModifySiteComponent,
    ShowSensorComponent, RemouveSensorComponent, ModifySensorComponent, RelayConfigComponent, HistoriqueComponent , ProfileComponent],
    imports: [
        CommonModule,
        PagesRoutingModule,
        LayoutModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        AgmCoreModule,
        ChartsModule,
        AngularDateTimePickerModule,
        NgMultiSelectDropDownModule
    ]
})
export class PagesModule {
}
