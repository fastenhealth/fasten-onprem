import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ToastNotification, ToastType } from '../../models/fasten/toast';
import { POSSIBLE_PERMISSIONS, User } from '../../models/fasten/user';
import { AuthService } from '../../services/auth.service';
import { FastenApiService } from '../../services/fasten-api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class UserEditComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  userId: string;
  userList: User[];
  errorMessage: string | null = null;
  permissionsList = POSSIBLE_PERMISSIONS;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private fastenApi: FastenApiService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.userId = this.route.snapshot.paramMap.get('user_id');
    forkJoin([
      this.fastenApi.getAllUsers(),
      this.fastenApi.getUser(this.userId)
    ]).subscribe(([allUsers, user]) => {
      this.userList = allUsers.filter(user => user.id !== this.userId).sort((a, b) => a.full_name.localeCompare(b.full_name));
      this.userForm = this.fb.group({
        full_name: [user.full_name, [Validators.required, Validators.minLength(2)]],
        username: [user.username, [Validators.required, Validators.minLength(4)]],
        email: [user.email, [Validators.email]],
        role: [user.role, Validators.required],
        permissions: this.fb.group({})
      });
      this.userList.forEach(otherUser => {
        const pfg = (this.userForm.get('permissions') as FormGroup);
        pfg.addControl(otherUser.id, this.fb.group({}));
        this.permissionsList.forEach(permission => {
          const isChecked = user.permissions?.[otherUser.id]?.[permission.value] ?? false;
          (pfg.get(otherUser.id) as FormGroup).addControl(permission.value, new FormControl(isChecked));
        });
      });
      this.loading = false;
    },
    (error) => {
      this.errorMessage = error.message;
      this.loading = false;
    });

  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;
      this.errorMessage = null;

      const user: User = this.userForm.value;
      user.id = this.userId;
      this.authService.updateUser(user).subscribe(
        (response) => {
          this.loading = false;
          const toastNotification = new ToastNotification();
          toastNotification.type = ToastType.Success;
          toastNotification.message = 'User updated successfully';
          this.toastService.show(toastNotification);
          this.router.navigate(['/users']);
        },
        (error) => {
          this.loading = false;
          this.errorMessage = 'Error updating user: ' + error.message;
        }
      );
    }
  }
}
