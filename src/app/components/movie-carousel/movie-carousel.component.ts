import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { Movie } from 'src/app/models/movie.model';

@Component({
  selector: 'app-movie-carousel',
  templateUrl: './movie-carousel.component.html',
  styleUrls: ['./movie-carousel.component.scss'],
  standalone: false
})
export class MovieCarouselComponent implements AfterViewInit, OnChanges {
  @Input() categoriasConfig: { titulo: string; lista: Movie[] }[] = [];
  @Input() isAdmin: boolean = false;

  @Output() select = new EventEmitter<Movie>();
  @Output() edit = new EventEmitter<Movie>();
  @Output() delete = new EventEmitter<Movie>();

  @ViewChildren('carruselContainer') carruselContainers!: QueryList<ElementRef<HTMLDivElement>>;

  carruselIndices: { [key: string]: number } = {};

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoriasConfig']) {
      this.carruselIndices = {};
      this.categoriasConfig.forEach(cat => (this.carruselIndices[cat.titulo] = 0));

      this.cdr.detectChanges();
      setTimeout(() => this.updateAll(), 0);
    }
  }

  ngAfterViewInit(): void {
    this.updateAll();

    this.carruselContainers.changes.subscribe(() => {
      setTimeout(() => this.updateAll(), 0);
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateAll();
  }

  nextCarrusel(titulo: string): void {
    const cat = this.categoriasConfig.find(c => c.titulo === titulo);
    if (!cat || cat.lista.length === 0) return;
    const max = cat.lista.length;
    this.carruselIndices[titulo] = (this.carruselIndices[titulo] + 1) % max;
    this.updateCarrusel(titulo);
  }

  prevCarrusel(titulo: string): void {
    const cat = this.categoriasConfig.find(c => c.titulo === titulo);
    if (!cat || cat.lista.length === 0) return;
    const max = cat.lista.length;
    this.carruselIndices[titulo] = (this.carruselIndices[titulo] - 1 + max) % max;
    this.updateCarrusel(titulo);
  }

  private updateAll(): void {
    this.categoriasConfig.forEach(cat => this.updateCarrusel(cat.titulo));
  }

  private updateCarrusel(titulo: string): void {
    const index = this.categoriasConfig.findIndex(c => c.titulo === titulo);
    const container = this.carruselContainers?.toArray()[index]?.nativeElement;
    if (!container) return;

    const track = container.querySelector<HTMLDivElement>('.track');
    const item = container.querySelector<HTMLDivElement>('.movie');
    if (!track || !item) return;

    const itemWidth = this.getItemWidth(item);
    const offset = (this.carruselIndices[titulo] || 0) * itemWidth;

    track.style.transform = `translateX(-${offset}px)`;
  }

  private getItemWidth(item: HTMLDivElement): number {
    // Usa bounding rect + margin-right para cálculo consistente, sin depender de imagen cargada
    const rect = item.getBoundingClientRect();
    const style = getComputedStyle(item);
    const mr = parseInt(style.marginRight || '0', 10);
    const ml = parseInt(style.marginLeft || '0', 10);
    return Math.round(rect.width + ml + mr);
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
