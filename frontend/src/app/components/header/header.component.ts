import { Component, OnInit } from '@angular/core';
import {FastenDbService} from '../../services/fasten-db.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private fastenDb: FastenDbService, private router: Router) { }

  ngOnInit() {
  }

  closeMenu(e) {
    e.target.closest('.dropdown').classList.remove('show');
    e.target.closest('.dropdown .dropdown-menu').classList.remove('show');
  }

  toggleHeaderMenu(event) {
    event.preventDefault();
    document.querySelector('body').classList.toggle('az-header-menu-show');
  }

  signOut(e) {
    this.fastenDb.Logout()
      .then(() => this.router.navigate(['auth/signin']))
  }
}
