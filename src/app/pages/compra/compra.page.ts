import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { SubscriptionService, Subscription } from '../../services/subscription.service';
import { AuthService } from '../../services/auth/auth';
import { mapFirebaseError } from '../../utils/error-utils';

@Component({
  selector: 'app-compra',
  templateUrl: './compra.page.html',
  styleUrls: ['./compra.page.scss'],
  standalone: false,
})
export class CompraPage implements OnInit {
  isLoading = false;
  currentPlan: string | null = 'gratis';
  showRequestForm = false;
  movieName = '';
  movieDescription = '';
  movieLanguage = '';

  constructor(
    private messageService: MessageService,
    private subscriptionService: SubscriptionService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      try {
        const subs = await this.subscriptionService.getSubscription(user.uid);
        if (subs) {
          this.currentPlan = subs.subscriptionType;
        } else {
          const defaultSubscription: Subscription = {
            email: user.email,
            subscriptionType: 'gratis',
            subscriptionDate: null,
            status: 'activo',
            priceCOP: 0,
          };
          await this.subscriptionService.saveSubscription(user.uid, defaultSubscription);
          this.currentPlan = 'gratis';
        }
      } catch (err) {
        this.messageService.showMessage(mapFirebaseError(err), 'error');
        this.currentPlan = 'gratis';
      }
    }
  }

  async selectOption(option: string) {
    this.isLoading = true;

    setTimeout(async () => {
      this.isLoading = false;
      const user = this.authService.getUser();

      if (!user) {
        this.messageService.showMessage(mapFirebaseError({ code: 'unauthenticated' }), 'error');
        return;
      }

      if (this.currentPlan && this.currentPlan !== 'gratis' && option !== this.currentPlan) {
        this.messageService.showMessage('Ya tienes un plan activo', 'error');
        return;
      }

      let subscriptionType = '';
      let priceCOP = 0;

      switch (option) {
        case 'gratis':
          subscriptionType = 'gratis';
          priceCOP = 0;
          break;
        case 'premium':
          subscriptionType = 'premium';
          priceCOP = 39900;
          break;
        case 'familiar':
          subscriptionType = 'familiar';
          priceCOP = 69900;
          break;
        case 'estudiantes':
          subscriptionType = 'estudiantes';
          priceCOP = 19900;
          break;
        case 'solicitud':
          this.showRequestForm = true;
          return;
      }

      try {
        await this.subscriptionService.saveSubscription(user.uid, {
          email: user.email,
          subscriptionType,
          subscriptionDate: null,
          status: 'activo',
          priceCOP,
        });
        this.currentPlan = subscriptionType;
        this.messageService.showMessage(`Suscripción ${subscriptionType} activada`, 'success');
      } catch (err) {
        this.messageService.showMessage(mapFirebaseError(err), 'error');
      }
    }, 1500);
  }

  async enviarSolicitud() {
    const user = this.authService.getUser();
    if (!user) {
      this.messageService.showMessage(mapFirebaseError({ code: 'unauthenticated' }), 'error');
      return;
    }

    if (!this.movieName.trim() || !this.movieDescription.trim() || !this.movieLanguage.trim()) {
      this.messageService.showMessage(
        mapFirebaseError({ code: 'solicitud/missing-fields' }),
        'error'
      );
      return;
    }

    try {
      await this.subscriptionService.saveMovieRequest(user.uid, {
        email: user.email,
        requestType: 'solicitud',
        requestDate: new Date(),
        status: 'pendiente',
        priceCOP: 12000,
        movieName: this.movieName,
        movieDescription: this.movieDescription,
        movieLanguage: this.movieLanguage,
      });

      this.messageService.showMessage('Tu solicitud de película ha sido registrada', 'success');

      this.movieName = '';
      this.movieDescription = '';
      this.movieLanguage = '';
      this.showRequestForm = false;
    } catch (err) {
      this.messageService.showMessage(mapFirebaseError(err), 'error');
    }
  }

  cancelarSolicitud() {
    this.showRequestForm = false;
    this.movieName = '';
    this.movieDescription = '';
    this.movieLanguage = '';
  }

  async eliminarSuscripcion() {
    const user = this.authService.getUser();
    if (!user) {
      this.messageService.showMessage(mapFirebaseError({ code: 'unauthenticated' }), 'error');
      return;
    }

    try {
      await this.subscriptionService.deleteSubscription(user.uid);
      const defaultSubscription: Subscription = {
        email: user.email,
        subscriptionType: 'gratis',
        subscriptionDate: null,
        status: 'activo',
        priceCOP: 0,
      };
      await this.subscriptionService.saveSubscription(user.uid, defaultSubscription);
      this.currentPlan = 'gratis';
      this.messageService.showMessage('Suscripción eliminada. Se activó automáticamente la cuenta GRATIS', 'info');
    } catch (err) {
      this.messageService.showMessage(mapFirebaseError(err), 'error');
    }
  }
}
