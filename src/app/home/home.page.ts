import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { Movie } from 'src/app/models/movie.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, AfterViewInit {
  featuredList: Movie[] = [
    { id: '1', title: 'Inception', imageUrl: 'assets/inception.jpg' },
    { id: '2', title: 'Interstellar', imageUrl: 'assets/interstellar.jpg' },
    { id: '3', title: 'The Dark Knight', imageUrl: 'assets/dark-knight.jpg' },
    { id: '4', title: 'Tenet', imageUrl: 'assets/tenet.jpg' }
  ];

  currentIndex = 0;
  slideInterval: any;

  @ViewChild('carruselContainer') carruselContainer!: ElementRef;
  carruselIndex = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  ngAfterViewInit(): void {
    this.updateCarrusel();
    window.addEventListener('resize', () => this.updateCarrusel());
  }

  showSlide(index: number) {
    this.currentIndex = index;
    this.resetInterval();
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.featuredList.length;
  }

  resetInterval() {
    clearInterval(this.slideInterval);
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  goToMovie(id: string) {
    this.router.navigate(['/detalle-pelicula'], { queryParams: { id } });
  }

  nextCarrusel() {
    const items = this.featuredList.length;
    this.carruselIndex = (this.carruselIndex + 1) % items;
    this.updateCarrusel();
  }

  prevCarrusel() {
    if (this.carruselIndex > 0) {
      this.carruselIndex--;
      this.updateCarrusel();
    }
  }

  updateCarrusel() {
    const container = this.carruselContainer.nativeElement;
    const item = container.querySelector('.movie');
    if (!item) return;

    const style = getComputedStyle(item);
    const itemWidth =
      item.offsetWidth +
      parseInt(style.marginLeft) +
      parseInt(style.marginRight);

    container.style.transform = `translateX(-${this.carruselIndex * itemWidth}px)`;
  }
}
