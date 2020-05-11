import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {PageService} from '../../../pages/pages/page.service';

@Component({
  selector: 'app-relay-config',
  templateUrl: './relay-config.component.html',
  styleUrls: ['./relay-config.component.scss']
})
export class RelayConfigComponent implements OnInit {
  Loaded = false;
  private ChartTab = [];
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
    this.load_data();
  }
  async load_data() {
    this.ChartTab = [];
    await this.pageService.currentRelayMessage.subscribe(data => {
      this.ChartTab = data;
      this.Loaded = true;
      console.log('pageService :', this.ChartTab);
    });
    console.log('pageService :', this.ChartTab);
    this.ref.detectChanges();
  }

}
