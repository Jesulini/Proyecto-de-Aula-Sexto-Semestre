import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from 'src/app/models/movie.model';
import { AuthService, User } from 'src/app/services/auth/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MoviesService } from 'src/app/services/movies/movies.service';
import { MessageService } from 'src/app/services/message.service';
import { mapFirebaseError } from 'src/app/utils/error-utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  featuredList: Movie[] = [];
  moviesAccion: Movie[] = [];
  moviesRomance: Movie[] = [];
  moviesTerror: Movie[] = [];

  sliderIndex = 0;
  slideInterval: any;

  isAdmin = false;

  modalAbierto = false;
  editando = false;
  peliculaTemp: Movie = {
    id: '',
    title: '',
    imageUrl: '',
    category: '',
    description: '',
    trailerUrl: '',
    movieUrl: '',
    // nuevos campos inicializados
    AgeRating: '',
    ParaTodosOAdultos: '',
    PegiRating: '',
    isLoading: false
  };

  modalReproducirAbierto = false;
  peliculaReproducir: Movie | null = null;

  categorias: string[] = ['Acción', 'Romance', 'Ciencia Ficción', 'Animación', 'Terror'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestore: Firestore,
    private sanitizer: DomSanitizer,
    private moviesService: MoviesService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
    const user = this.authService.getUser();
    const email = user?.email?.trim().toLowerCase() || '';
    this.isAdmin = email === 'jesulini14@gmail.com';
    this.loadMovies();
  }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  async loadMovies(): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { items: Movie[] };
        // Aseguramos que los nuevos campos existan y ponemos isLoading para el efecto
        const allMovies = (data.items || []).map(m => ({
          ...m,
          AgeRating: (m as any).AgeRating || '',
          ParaTodosOAdultos: (m as any).ParaTodosOAdultos || '',
          PegiRating: (m as any).PegiRating || '',
          isLoading: true
        }));

        // Simulación de carga: desactivar loading después de un pequeño delay
        setTimeout(() => {
          this.featuredList = allMovies.map(m => ({ ...m, isLoading: false }));
          this.moviesAccion = this.featuredList.filter(m => m.category === 'Acción');
          this.moviesRomance = this.featuredList.filter(m => m.category === 'Romance');
          this.moviesTerror = this.featuredList.filter(m => m.category === 'Terror');
        }, 800);
      }
    } catch (error: any) {
      const msg = mapFirebaseError(error);
      this.messageService.showMessage(msg, 'error');
    }
  }

  nextSlide(): void {
    if (this.featuredList.length === 0) return;
    this.sliderIndex = (this.sliderIndex + 1) % this.featuredList.length;
  }

  prevSlide(): void {
    if (this.featuredList.length === 0) return;
    this.sliderIndex = (this.sliderIndex - 1 + this.featuredList.length) % this.featuredList.length;
  }

  showSlide(index: number): void {
    this.sliderIndex = index;
    this.resetInterval();
  }

  resetInterval(): void {
    clearInterval(this.slideInterval);
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  goToCurrentSliderMovie(): void {
    if (!this.featuredList.length) return;
    const movie = this.featuredList[this.sliderIndex];
    if (movie?.id) {
      this.router.navigate(['/detalle-pelicula'], { queryParams: { id: movie.id } });
    }
  }

  goToMovie(movie: Movie): void {
    if (movie?.id) {
      this.router.navigate(['/detalle-pelicula'], { queryParams: { id: movie.id } });
    }
  }

  async abrirModalReproducir(movie: Movie): Promise<void> {
    this.peliculaReproducir = movie;
    this.modalReproducirAbierto = true;

    const usuario: User | null = this.authService.getUsuarioActual();
    if (usuario && movie) {
      try {
        await this.moviesService.registerHistory(usuario.uid, movie);
      } catch (error: any) {
        const msg = mapFirebaseError(error);
        this.messageService.showMessage(msg, 'error');
      }
    }
  }

  cerrarModalReproducir(): void {
    this.modalReproducirAbierto = false;
    this.peliculaReproducir = null;
  }

  abrirModalAgregar(): void {
    this.editando = false;
    this.peliculaTemp = {
      id: '',
      title: '',
      imageUrl: '',
      category: '',
      description: '',
      trailerUrl: '',
      movieUrl: '',
      AgeRating: '',
      ParaTodosOAdultos: '',
      PegiRating: '',
      isLoading: false
    };
    this.modalAbierto = true;
  }

  abrirModalEditar(movie: Movie): void {
    this.editando = true;
    // Aseguramos que existan los campos nuevos
    this.peliculaTemp = {
      ...movie,
      AgeRating: (movie as any).AgeRating || '',
      ParaTodosOAdultos: (movie as any).ParaTodosOAdultos || '',
      PegiRating: (movie as any).PegiRating || ''
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  async guardarPelicula(): Promise<void> {
    const {
      title,
      imageUrl,
      category,
      description,
      trailerUrl,
      movieUrl,
      AgeRating,
      ParaTodosOAdultos,
      PegiRating,
      id
    } = this.peliculaTemp as any;

    if (!title?.trim() || !imageUrl?.trim() || !category?.trim()) {
      this.messageService.showMessage(mapFirebaseError({ code: 'auth/missing-fields' }), 'error');
      return;
    }

    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');

      if (this.editando && id) {
        this.featuredList = this.featuredList.map(p =>
          p.id === id
            ? {
                ...p,
                title,
                imageUrl,
                category,
                description,
                trailerUrl,
                movieUrl,
                AgeRating,
                ParaTodosOAdultos,
                PegiRating
              }
            : p
        );
        // Actualizamos la lista completa en Firestore
        await updateDoc(docRef, { items: this.featuredList });
        this.messageService.showMessage('Película actualizada.', 'success');
      } else {
        const nuevaPeli: Movie = {
          id: this.generarId(),
          title,
          imageUrl,
          category,
          description,
          trailerUrl,
          movieUrl,
          AgeRating,
          ParaTodosOAdultos,
          PegiRating,
          isLoading: true
        } as any;

        // Añadimos localmente y guardamos la lista completa
        this.featuredList.push(nuevaPeli);
        await updateDoc(docRef, { items: this.featuredList });
        this.messageService.showMessage('Película agregada.', 'success');

        setTimeout(() => {
          nuevaPeli.isLoading = false;
        }, 800);

        // Recalcular filtros
        this.moviesAccion = this.featuredList.filter(m => m.category === 'Acción');
        this.moviesRomance = this.featuredList.filter(m => m.category === 'Romance');
        this.moviesTerror = this.featuredList.filter(m => m.category === 'Terror');
      }
      this.cerrarModal();
    } catch (error: any) {
      const msg = mapFirebaseError(error);
      this.messageService.showMessage(msg, 'error');
    }
  }

  async deleteMovie(movie: Movie): Promise<void> {
    this.featuredList = this.featuredList.filter(p => p.id !== movie.id);
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      await updateDoc(docRef, { items: this.featuredList });
      this.messageService.showMessage('Película eliminada.', 'success');

      // Recalcular filtros
      this.moviesAccion = this.featuredList.filter(m => m.category === 'Acción');
      this.moviesRomance = this.featuredList.filter(m => m.category === 'Romance');
      this.moviesTerror = this.featuredList.filter(m => m.category === 'Terror');
    } catch (error: any) {
      const msg = mapFirebaseError(error);
      this.messageService.showMessage(msg, 'error');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.messageService.showMessage('Sesión cerrada correctamente.', 'info');
  }

  generarId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  esYoutubeUrl(url?: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getSafeUrl(url?: string): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.convertirUrlYoutube(url));
  }

  private convertirUrlYoutube(url: string): string {
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return url;
  }
}
