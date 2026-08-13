import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  isDarkMode = true;

  showPassword = false;

  isLoading = false;

  loginForm = new FormGroup({

    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),

    rememberMe: new FormControl(false)

  });

   constructor(
  private router: Router,
  private themeService: ThemeService
) {

  this.isDarkMode = this.themeService.isDarkMode();

}
  toggleTheme(): void {

    this.themeService.toggleTheme();

    this.isDarkMode = this.themeService.isDarkMode();

  }

  togglePassword(): void {

    this.showPassword = !this.showPassword;

  }

  normalizeEmail(): void {

    const emailControl = this.loginForm.get('email');

    if (emailControl && emailControl.value) {

      emailControl.setValue(
        emailControl.value.toString().trim().toLowerCase(),
        { emitEvent: false }
      );

    }

  }

  resetForm(): void {

    this.loginForm.reset({

      rememberMe: false

    });

    this.showPassword = false;

    this.isLoading = false;

  }

  blockPaste(event: ClipboardEvent): void {

    event.preventDefault();

    alert('Copy / Paste is not allowed.');

  }

  allowOnlyEmailCharacters(event: KeyboardEvent): void {

    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End'
    ];

    if (allowedKeys.includes(event.key)) {

      return;

    }

    const regex = /^[a-zA-Z0-9@._-]$/;

    if (!regex.test(event.key)) {

      event.preventDefault();

    }

  }

  login(): void {

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;

    }

    this.normalizeEmail();

    this.isLoading = true;

    const email = this.loginForm.value.email ?? '';

    const password = this.loginForm.value.password ?? '';

    setTimeout(() => {
      this.isLoading = false;

      if (email === 'admin@gmail.com' && password === '123456') {
        const storage = this.loginForm.value.rememberMe
          ? localStorage
          : sessionStorage;

        storage.setItem('isLoggedIn', 'true');
        storage.setItem('userEmail', email);
        storage.setItem('role', 'admin');

        alert('✅ Admin Login Successful');
        this.router.navigate(['/employees']);
      } else if (email === 'employee@gmail.com' && password === '123456') {
        const storage = this.loginForm.value.rememberMe
          ? localStorage
          : sessionStorage;

        storage.setItem('isLoggedIn', 'true');
        storage.setItem('userEmail', email);
        storage.setItem('role', 'employee');

        alert('✅ Employee Login Successful');
        this.router.navigate(['/employees']);
      } else {
        alert('❌ Invalid Email or Password');
        this.loginForm.get('password')?.reset();
        this.loginForm.get('password')?.markAsUntouched();
      }
    }, 1500);

  }

}
