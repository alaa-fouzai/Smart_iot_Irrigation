import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PagesComponent} from './pages/pages.component';
import {DashBoardComponent} from './dash-board/dash-board.component';
import {AddSiteComponent} from './pages/Site/add-site/add-site.component';
import {ShowSitesComponent} from './pages/Site/show-sites/show-sites.component';
import {RemouveSiteComponent} from './pages/Site/remouve-site/remouve-site.component';
import {ModifySiteComponent} from './pages/Site/modify-site/modify-site.component';
import {AddSensorComponent} from './pages/Sensor/add-sensor/add-sensor.component';
import {ShowSensorComponent} from './pages/Sensor/show-sensor/show-sensor.component';
import {RemouveSensorComponent} from './pages/Sensor/remouve-sensor/remouve-sensor.component';
import {ModifySensorComponent} from './pages/Sensor/modify-sensor/modify-sensor.component';
import {RelayConfigComponent} from './dash-board/relay-config/relay-config.component';
import {HistoriqueComponent} from './dash-board/historique/historique.component';


const routes: Routes = [
  {
    path: '', component: PagesComponent, children: [
      {path: '', component: DashBoardComponent },
      {path: 'Site/Add', component: AddSiteComponent },
      {path: 'Site/ShowSites', component: ShowSitesComponent },
      {path: 'Site/RemoveSites', component: RemouveSiteComponent },
      {path: 'Site/ModifySite', component: ModifySiteComponent },
      {path: 'Sensor/AddSensor', component: AddSensorComponent },
      {path: 'Sensor', component: ShowSensorComponent },
      {path: 'AddSensor', component: AddSensorComponent },
      {path: 'Sensor/RemoveSensor', component: RemouveSensorComponent },
      {path: 'Sensor/ModifySensor', component: ModifySensorComponent },
      {path: 'RelayConfig', component: RelayConfigComponent },
      {path: 'Historique', component: HistoriqueComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
