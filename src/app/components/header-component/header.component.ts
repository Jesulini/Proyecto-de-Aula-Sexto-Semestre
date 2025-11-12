import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {
  @Output() toggleMenuEvent = new EventEmitter<void>();
  @Input() pageTitle = '';  

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/home']);
  }

  toggleMenu() {
    this.toggleMenuEvent.emit();
  }
}
