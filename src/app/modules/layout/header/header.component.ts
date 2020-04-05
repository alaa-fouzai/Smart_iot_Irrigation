import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../../../models/Use.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  CurrentUser = new User();
  constructor(private router: Router) {
  }

  ngOnInit() {
    this.CurrentUser = JSON.parse(localStorage.getItem('currentUser'));
  }
  onLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }

}
