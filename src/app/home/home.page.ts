import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from 'src/app/models/movie.model';
import { AuthService, User } from 'src/app/services/auth/auth';
import { Firestore, doc, getDoc, collection, getDocs } from '@angular/fire/firestore';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MoviesService } from 'src/app/services/movies/movies.service';
import { MessageService } from 'src/app/services/message.service';
import { mapFirebaseError } from 'src/app/utils/error-utils';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { AdminPanelComponent } from '../components/AdminPanelComponent/admin-panel.component';

const PEGI_LIMITS: Record<string, number> = {
  gratis: 7,
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
  @ViewChild('adminPanel') adminPanel!: AdminPanelComponent;
  @ViewChild('menu') menu: any;

  featuredList: Movie[] = [];
  categoriasConfig: { titulo: string; lista: Movie[] }[] = [];
  isAdmin = false;
  currentPlan: string = 'gratis';
  modalReproducirAbierto = false;
  peliculaReproducir: Movie | null = null;
  categorias: string[] = ['Acción', 'Romance', 'Ciencia Ficción', 'Animación', 'Terror'];
  isEditingGlobal = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestore: Firestore,
    private sanitizer: DomSanitizer,
    private moviesService: MoviesService,
    private messageService: MessageService,
    private subscriptionService: SubscriptionService
  ) {}

  async ngOnInit(): Promise<void> {
    this.authService.usuarioActual$().subscribe(async user => {
      if (user && user.email) {
        const email = user.email.trim().toLowerCase();
        this.isAdmin = email === 'jesulini14@gmail.com';
        const subs = await this.subscriptionService.getSubscription(user.uid);
        this.currentPlan = subs?.subscriptionType || 'gratis';
      } else {
        this.isAdmin = false;
        this.currentPlan = 'gratis';
      }
      this.loadMovies();
    });
  }

  ngOnDestroy(): void {}

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
      let allMovies: Movie[] = [];
      if (docSnap.exists()) {
        const data = docSnap.data() as { items?: Movie[] };
        if (data.items && Array.isArray(data.items)) {
          allMovies = data.items.map(m => ({
            ...m,
            AgeRating: m.AgeRating || '',
            ParaTodosOAdultos: m.ParaTodosOAdultos || '',
            PegiRating: m.PegiRating || '',
            isLoading: true
          }));
        }
      }
      if (!allMovies.length) {
        const colRef = collection(this.firestore, 'peliculas');
        const snap = await getDocs(colRef);
        allMovies = snap.docs.map(d => {
          const m = d.data() as Movie;
          return {
            ...m,
            AgeRating: m.AgeRating || '',
            ParaTodosOAdultos: m.ParaTodosOAdultos || '',
            PegiRating: m.PegiRating || '',
            isLoading: true
          };
        });
      }
      this.featuredList = allMovies.map(m => ({ ...m, isLoading: false })).filter(m => this.puedeVerPelicula(m));
      this.updateCategoriasConfig();
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.messageService.showMessage('Sesión cerrada correctamente.', 'info');
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

  onEditingChange(editing: boolean): void {
    this.isEditingGlobal = editing;
  }

  onEditMovie(movie: Movie): void {
    this.isEditingGlobal = true;
    setTimeout(() => {
      if (this.adminPanel) {
        this.adminPanel.abrirEditar(movie);
      }
    });
  }

  onDeleteMovie(movie: Movie): void {
    if (!this.adminPanel) {
      this.isEditingGlobal = true;
      setTimeout(() => this.adminPanel?.deleteMovie(movie));
      return;
    }
    this.adminPanel.deleteMovie(movie);
  }

  volverAlHome(): void {
    if (this.menu) {
      this.menu.menuAbierto = false;
    }
    this.isEditingGlobal = false;
    this.router.navigate(['/home']);
  }
}


