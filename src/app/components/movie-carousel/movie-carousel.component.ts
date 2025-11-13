import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Movie } from 'src/app/models/movie.model';

@Component({
  selector: 'app-movie-carousel',
  templateUrl: './movie-carousel.component.html',
  styleUrls: ['./movie-carousel.component.scss'],
  standalone: false
})
export class MovieCarouselComponent implements AfterViewInit {
  @Input() title: string = '';
  @Input() movies: Movie[] = [];
  @Input() isAdmin: boolean = false;

  @Output() select = new EventEmitter<Movie>();
  @Output() edit = new EventEmitter<Movie>();
  @Output() delete = new EventEmitter<Movie>();

  @ViewChild('carruselContainer') carruselContainer!: ElementRef;

  carruselIndex = 0;

  ngAfterViewInit(): void {
    this.updateCarrusel();
    window.addEventListener('resize', () => this.updateCarrusel());
  }

  nextCarrusel(): void {
    if (this.movies.length === 0) return;
    this.carruselIndex = (this.carruselIndex + 1) % this.movies.length;
    this.updateCarrusel();
  }

  prevCarrusel(): void {
    if (this.movies.length === 0) return;
    this.carruselIndex = (this.carruselIndex - 1 + this.movies.length) % this.movies.length;
    this.updateCarrusel();
  }

  updateCarrusel(): void {
    const container = this.carruselContainer?.nativeElement;
    if (!container) return;
    const item = container.querySelector('.movie');
    if (!item) return;
    const style = getComputedStyle(item);
    const itemWidth = item.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
    container.style.transform = `translateX(-${this.carruselIndex * itemWidth}px)`;
    container.style.transition = 'transform 0.5s ease';
  }

  onSelect(movie: Movie): void {
    this.select.emit(movie);
  }

  onEdit(movie: Movie): void {
    this.edit.emit(movie);
  }

  onDelete(movie: Movie): void {
    this.delete.emit(movie);
  }
}
