import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false,
})
export class ForgotPasswordPage {
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async resetPassword() {
    if (!this.email) {
      this.showToast('Por favor, ingresa tu correo electrónico.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Enviando enlace de recuperación...',
    });
    await loading.present();

    try {
      await this.authService.resetPassword(this.email);
      await loading.dismiss();
      this.showToast('Te hemos enviado un correo para restablecer tu contraseña.');
      this.router.navigate(['/login']);
    } catch (err: any) {
      await loading.dismiss();
      this.showToast(err.message || 'Error al enviar el correo.');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
    });
    toast.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
