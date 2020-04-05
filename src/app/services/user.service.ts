import { Injectable } from '@angular/core';
import { User } from '../models/Use.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public currentUser = new User();
  constructor() { }
  public Alocate_user(id, firstname , Lastname , email , createddate , locationIds ) {
    this.currentUser.id = id;
    this.currentUser.FirstName = firstname;
    this.currentUser.LastName = Lastname;
    this.currentUser.email = email;
    this.currentUser.createdate = createddate;
    this.currentUser.locationIds = locationIds;
  }
  public Logout() {
    this.currentUser.id = null;
    this.currentUser.FirstName = null;
    this.currentUser.LastName = null;
    this.currentUser.email = null;
    this.currentUser.createdate = null;
    this.currentUser.locationIds = null;
  }
  public getCurrentUser(): User {
    return this.currentUser;
  }
}
