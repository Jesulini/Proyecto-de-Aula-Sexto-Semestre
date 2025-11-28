import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { MessageService } from '../services/message.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router, private messageService: MessageService) {}

  async canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          resolve(true);
        } else {
          this.messageService.showMessage('Debes iniciar sesión para acceder a esta página', 'error');
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }
}
