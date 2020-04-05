import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  constructor() {}
  loggedIn() {
    return !!localStorage.getItem('token');
  }
}
