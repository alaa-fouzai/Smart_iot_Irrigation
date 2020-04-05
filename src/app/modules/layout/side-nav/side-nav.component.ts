import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Location} from '../../../models/Location.model';
import {PageService} from '../../../modules/pages/pages/page.service';
import Swal from 'sweetalert2';


declare var $;

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
  private SideNaveApi = 'api/dashboard/sidenav';
  private names = [];
  message: string;

  constructor(private http: HttpClient, private pageServise: PageService) {
  }

  ngOnInit() {
    this.pageServise.currentMessage.subscribe(message => this.message = message);
    this.load_data();
    $(document).ready(() => {
      $('.sidebar-menu').tree();
    });
  }
  async load_data() {
    const options = {
      params: new HttpParams().append('token', localStorage.getItem('token'))
    };
    await this.http.get(this.SideNaveApi, options).subscribe(data => {
      const resSTR = JSON.stringify(data);
      const resJSON = JSON.parse(resSTR);
      if (resJSON.status === 'ok') {
        resJSON.response.forEach((item) => {
          this.names.push(item);
        });
      } else if (resJSON.status === 'err') {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: resJSON.message,
        });
      }
    }, error => {
      console.log(error.toString());
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
      console.log(error.toString());
    });
    console.log(this.names);
    if (this.names.length > 0 ) {
      this.newMessge(this.names[0]._id);
    } else {
      this.newMessge('none here');
    }
      }
      newMessge(name) {
          this.pageServise.changeMessage(name);
      }
      onClick(item) {
          console.log(item);
          this.newMessge(item._id);
      }

}
