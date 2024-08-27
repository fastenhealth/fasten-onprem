import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../models/fasten/user';
import { FastenApiService } from '../../services/fasten-api.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading: boolean = false;

  constructor(
    private fastenApi: FastenApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.fastenApi.getAllUsers().subscribe((users: User[]) => {
      this.users = users;
      this.loading = false;
    },
      error => {
        console.error('Error loading users:', error);
        this.loading = false;
      });
  }
}
