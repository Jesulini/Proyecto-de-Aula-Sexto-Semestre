import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth';
import { MessageService } from 'src/app/services/message.service';
import { mapFirebaseError } from 'src/app/utils/error-utils';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false,
})
export class ForgotPasswordPage {
  email: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  async resetPassword() {
    const validationError = this.validateForm();
    if (validationError) {
      this.messageService.showMessage(mapFirebaseError({ code: validationError }), 'error');
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.resetPassword(this.email.trim().toLowerCase());
      this.isLoading = false;
      this.messageService.showMessage(
        'Te hemos enviado un correo para restablecer tu contraseña.',
        'success'
      );
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.isLoading = false;
      const msg = mapFirebaseError(err);
      this.messageService.showMessage(msg, 'error');
    }
  }

  validateForm(): string | null {
    if (!this.email || this.email.trim().length === 0) return 'auth/missing-email';

    this.email = this.email.trim().toLowerCase();

    if (this.email.length < 5) return 'auth/invalid-email';
    if (this.email.length > 100) return 'auth/email-too-long';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) return 'auth/invalid-email';

    return null;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
