import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from 'src/app/models/movie.model';
import { AuthService, User } from 'src/app/services/auth/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MoviesService } from 'src/app/services/movies/movies.service';
import { MessageService } from 'src/app/services/message.service';
import { mapFirebaseError } from 'src/app/utils/error-utils';
import { SubscriptionService } from 'src/app/services/subscription.service';

const PEGI_LIMITS: Record<string, number> = {
  gratis: 3,
  estudiantes: 7,
  familiar: 12,
  premium: 18
};

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, OnDestroy {
  featuredList: Movie[] = [];
  categoriasConfig: { titulo: string; lista: Movie[] }[] = [];

  isAdmin = false;
  currentPlan: string = 'gratis';

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
    AgeRating: '',
    ParaTodosOAdultos: '',
    PegiRating: '',
    isLoading: false
  };

  modalReproducirAbierto = false;
  peliculaReproducir: Movie | null = null;

  categorias: string[] = ['Acción', 'Romance', 'Ciencia Ficción', 'Animación', 'Terror', 'Comedia'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestore: Firestore,
    private sanitizer: DomSanitizer,
    private moviesService: MoviesService,
    private messageService: MessageService,
    private subscriptionService: SubscriptionService
  ) { }

  async ngOnInit(): Promise<void> {
    const user = this.authService.getUser();
    const email = user?.email?.trim().toLowerCase() || '';
    this.isAdmin = email === 'jesulini14@gmail.com';

    if (user) {
      const subs = await this.subscriptionService.getSubscription(user.uid);
      this.currentPlan = subs?.subscriptionType || 'gratis';
    }

    this.loadMovies();
  }

  ngOnDestroy(): void { }

  private updateCategoriasConfig(): void {
    this.categoriasConfig = [
      { titulo: 'Destacadas', lista: this.featuredList.filter(m => this.puedeVerPelicula(m)) },
      ...this.categorias.map(cat => ({
        titulo: cat,
        lista: this.featuredList.filter(m => m.category === cat && this.puedeVerPelicula(m))
      }))
    ];
  }

  puedeVerPelicula(movie: Movie): boolean {
    const plan = this.currentPlan || 'gratis';
    const limite = PEGI_LIMITS[plan];
    const pegiStr = movie.PegiRating || '';
    const pegi = parseInt(pegiStr.replace(/\D/g, ''), 10);
    return isNaN(pegi) ? true : pegi <= limite;
  }

  async loadMovies(): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { items: Movie[] };
        const allMovies = (data.items || []).map(m => ({
          ...m,
          AgeRating: m.AgeRating || '',
          ParaTodosOAdultos: m.ParaTodosOAdultos || '',
          PegiRating: m.PegiRating || '',
          isLoading: true
        }));

        setTimeout(() => {
          this.featuredList = allMovies
            .map(m => ({ ...m, isLoading: false }))
            .filter(m => this.puedeVerPelicula(m));
          this.updateCategoriasConfig();
        }, 800);
      }
    } catch (error: any) {
      const msg = mapFirebaseError(error);
      this.messageService.showMessage(msg, 'error');
    }
  }
  goToCurrentSliderMovie(): void {
    if (!this.featuredList.length) return;
    const movie = this.featuredList[0];
    if (movie?.id) {
      if (!this.puedeVerPelicula(movie)) {
        this.messageService.showMessage('Tu plan no permite ver esta película por clasificación PEGI.', 'error');
        return;
      }
      this.router.navigate(['/detalle-pelicula'], { queryParams: { id: movie.id } });
    }
  }

  goToMovie(movie: Movie): void {
    if (movie?.id) {
      if (!this.puedeVerPelicula(movie)) {
        this.messageService.showMessage('Tu plan no permite ver esta película por clasificación PEGI.', 'error');
        return;
      }
      this.router.navigate(['/detalle-pelicula'], { queryParams: { id: movie.id } });
    }
  }

  async abrirModalReproducir(movie: Movie): Promise<void> {
    if (!this.puedeVerPelicula(movie)) {
      this.messageService.showMessage('Tu plan no permite reproducir esta película por clasificación PEGI.', 'error');
      return;
    }

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
    this.peliculaTemp = {
      ...movie,
      AgeRating: movie.AgeRating || '',
      ParaTodosOAdultos: movie.ParaTodosOAdultos || '',
      PegiRating: movie.PegiRating || ''
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  async guardarPelicula(): Promise<void> {
    const { title, imageUrl, category, description, trailerUrl, movieUrl, AgeRating, ParaTodosOAdultos, PegiRating, id } = this.peliculaTemp;

    if (!title?.trim() || !imageUrl?.trim() || !category?.trim() || !PegiRating?.trim()) {
      this.messageService.showMessage(mapFirebaseError({ code: 'auth/missing-fields' }), 'error');
      return;
    }

    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');

      if (this.editando && id) {
        this.featuredList = this.featuredList.map(p =>
          p.id === id
            ? { ...p, title, imageUrl, category, description, trailerUrl, movieUrl, AgeRating, ParaTodosOAdultos, PegiRating }
            : p
        );
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
        };

        this.featuredList.push(nuevaPeli);
        await updateDoc(docRef, { items: this.featuredList });
        this.messageService.showMessage('Película agregada.', 'success');

        setTimeout(() => {
          nuevaPeli.isLoading = false;
        }, 800);
      }
      this.updateCategoriasConfig();
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
      this.updateCategoriasConfig();
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
