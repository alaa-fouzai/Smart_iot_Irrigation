import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../../../models/Use.model';
import { AuthService } from 'angularx-social-login';
import {PageService} from '../../pages/pages/page.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  CurrentUser = new User();
  constructor(private router: Router, private authService: AuthService, private pageService: PageService) {
  }

  ngOnInit() {
    this.CurrentUser = JSON.parse(localStorage.getItem('currentUser'));
  }
  onLogout() {
    this.pageService.DisconnectNotification(this.CurrentUser.id);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    try {
      this.authService.signOut();
    } catch (e) {
    }
    this.router.navigate(['/auth']);
  }

}
