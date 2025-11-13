import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth';
import { LoadingController } from '@ionic/angular';
import { MessageService } from 'src/app/services/message.service';
import { mapFirebaseError } from 'src/app/utils/error-utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private messageService: MessageService
  ) {}

  async login() {
    const validationError = this.validateForm();
    if (validationError) {
      this.messageService.showMessage(mapFirebaseError({ code: validationError }), 'error');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Iniciando sesión...' });
    await loading.present();

    try {
      await this.authService.login(this.email.trim().toLowerCase(), this.password);
      await loading.dismiss();

      this.messageService.showMessage('Inicio de sesión exitoso', 'success');

      this.router.navigate(['/home']);
    } catch (err: any) {
      await loading.dismiss();
      const msg = mapFirebaseError(err);
      this.messageService.showMessage(msg, 'error');
    }
  }

 
  validateForm(): string | null {
    if (!this.email || this.email.trim().length === 0 || !this.password || this.password.trim().length === 0) {
      return 'auth/missing-fields';
    }

    this.email = this.email.trim().toLowerCase();

    if (this.email.length < 5) return 'auth/invalid-email';
    if (this.email.length > 100) return 'auth/email-too-long';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) return 'auth/invalid-email';

    if (this.password.trim().length < 6) return 'auth/weak-password';
    if (this.password.length > 50) return 'auth/password-too-long';

    return null;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
