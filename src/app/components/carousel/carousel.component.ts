import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Movie } from 'src/app/models/movie.model';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  standalone: false
})
export class CarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() items: Movie[] = [];
  @Output() play = new EventEmitter<Movie>();
  @Output() info = new EventEmitter<Movie>();

  sliderIndex = 0;
  autoSlideInterval: any;

  private pointerStartX = 0;
  private pointerEndX = 0;
  private dragging = false;

  // Limitamos a 5 películas
  get limitedItems(): Movie[] {
    return this.items.slice(0, 5);
  }

  // Película activa actual
  get activeMovie(): Movie | undefined {
    return this.limitedItems[this.sliderIndex];
  }

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSlideInterval);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      if (this.sliderIndex >= this.limitedItems.length) {
        this.sliderIndex = 0;
      }
    }
  }

  private startAutoSlide(): void {
    clearInterval(this.autoSlideInterval);
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    const len = this.limitedItems.length;
    if (!len) return;
    this.sliderIndex = (this.sliderIndex + 1) % len;
  }

  prevSlide(): void {
    const len = this.limitedItems.length;
    if (!len) return;
    this.sliderIndex = (this.sliderIndex - 1 + len) % len;
  }

  showSlide(index: number): void {
    const len = this.limitedItems.length;
    if (!len) return;
    this.sliderIndex = Math.max(0, Math.min(index, len - 1));
    this.resetInterval();
  }

  private resetInterval(): void {
    clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
  }

  // Emiten SIEMPRE la película visible
  onPlay(): void {
    if (this.activeMovie) {
      this.play.emit(this.activeMovie);
    }
  }

  onInfo(): void {
    if (this.activeMovie) {
      this.info.emit(this.activeMovie);
    }
  }

  // Swipe con Pointer Events
  onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    this.pointerStartX = event.clientX;
    this.pointerEndX = event.clientX;
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    this.pointerEndX = event.clientX;
  }

  onPointerUp(): void {
    if (!this.dragging) return;
    this.dragging = false;
    const deltaX = this.pointerEndX - this.pointerStartX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
      this.resetInterval();
    }
    this.pointerStartX = 0;
    this.pointerEndX = 0;
  }

  trackById(_: number, movie: Movie): string {
    return movie.id || `${movie.title}-${movie.imageUrl}`;
  }
}
