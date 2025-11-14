import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth';
import { MessageService } from 'src/app/services/message.service';
import { mapFirebaseError } from 'src/app/utils/error-utils';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  async register() {
    const validationError = this.validateForm();
    if (validationError) {
      this.messageService.showMessage(mapFirebaseError({ code: validationError }), 'error');
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.register(this.nombre.trim(), this.email.trim().toLowerCase(), this.password);
      this.isLoading = false;
      this.messageService.showMessage('Cuenta creada exitosamente', 'success');
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.isLoading = false;
      const msg = mapFirebaseError(err);
      this.messageService.showMessage(msg, 'error');
    }
  }

  validateForm(): string | null {
    if (!this.nombre.trim() || !this.email.trim() || !this.password || !this.confirmPassword) {
      return 'auth/missing-fields';
    }

    const nameRegex = /^[a-zA-Z0-9_ ]+$/;
    if (this.nombre.trim().length < 3) return 'auth/invalid-display-name';
    if (this.nombre.trim().length > 30) return 'auth/display-name-too-long';
    if (!nameRegex.test(this.nombre.trim())) return 'auth/display-name-invalid-chars';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) return 'auth/invalid-email';
    if (this.email.length > 100) return 'auth/email-too-long';

    if (this.password.trim().length < 6) return 'auth/weak-password';
    if (this.password.length > 50) return 'auth/password-too-long';

    if (this.password !== this.confirmPassword) return 'auth/password-mismatch';

    return null;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
