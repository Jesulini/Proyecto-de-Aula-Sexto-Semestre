import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-movie-loading',
  templateUrl: './movie-loading.component.html',
  styleUrls: ['./movie-loading.component.scss'],
  standalone: false
})
export class MovieLoadingComponent {
  @Input() message: string = 'Cargando...';
}
