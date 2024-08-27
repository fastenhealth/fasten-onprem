import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../models/fasten/user';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastNotification, ToastType } from '../../models/fasten/toast';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;
      const newUser: User = this.userForm.value;
      this.authService.createUser(newUser).subscribe(
        (response) => {
          this.loading = false;
          const toastNotification = new ToastNotification();
          toastNotification.type = ToastType.Success;
          toastNotification.message = 'User created successfully';
          this.toastService.show(toastNotification);
          this.router.navigate(['/users']);
        },
        (error) => {
          this.loading = false;
          const toastNotification = new ToastNotification();
          toastNotification.type = ToastType.Error;
          toastNotification.message = 'Error creating user: ' + error.message;
          this.toastService.show(toastNotification);
        }
      );
    }
  }
}
