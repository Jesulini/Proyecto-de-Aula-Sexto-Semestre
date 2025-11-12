import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  standalone: false
})
export class SidebarMenuComponent {
  @Input() esAdmin = false;
  menuAbierto = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
