import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from 'src/app/models/movie.model';
import { AuthService } from 'src/app/services/auth/auth';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { MessageService } from 'src/app/services/message.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { AdminPanelComponent } from 'src/app/components/AdminPanelComponent/admin-panel.component';

const PEGI_LIMITS: Record<string, number> = {
  gratis: 7,
  estudiantes: 7,
  familiar: 12,
  premium: 18
};

@Component({
  selector: 'app-cartelera',
  templateUrl: './cartelera.page.html',
  styleUrls: ['./cartelera.page.scss'],
  standalone: false
})
export class CarteleraPage implements OnInit, OnDestroy {
  @ViewChild('adminPanel') adminPanel!: AdminPanelComponent;

  peliculas: Movie[] = [];
  peliculasFiltradas: Movie[] = [];
  categorias: string[] = ['Todos', 'Acción', 'Romance', 'Ciencia Ficción', 'Animación', 'Terror'];
  categoriaSeleccionada = 'Todos';
  terminoBusqueda = '';

  esAdmin = false;
  currentPlan: string = 'gratis';
  isEditingGlobal = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestore: Firestore,
    private messageService: MessageService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit() {
    this.ionViewWillEnter();
  }

  async ionViewWillEnter() {
    const user = this.authService.getUsuarioActual();
    const email = user?.email?.trim().toLowerCase() || '';
    this.esAdmin = email === 'jesulini14@gmail.com';

    if (user) {
      const subs = await this.subscriptionService.getSubscription(user.uid);
      this.currentPlan = subs?.subscriptionType || 'gratis';
    } else {
      this.currentPlan = 'gratis';
      this.peliculas = [];
      this.peliculasFiltradas = [];
    }

    this.cargarPeliculas();
  }

  async cargarPeliculas() {
    try {
      const colRef = collection(this.firestore, 'peliculas');
      const snap = await getDocs(colRef);
      this.peliculas = snap.docs.map(d => {
        const m = d.data() as Movie;
        const { id, ...rest } = m;
        return { id: d.id, ...rest };
      });
      this.buscarPeliculas();
    } catch (error) {
      console.error('Error cargando películas:', error);
    }
  }

  puedeVerPelicula(movie: Movie): boolean {
    const plan = this.currentPlan || 'gratis';
    const limite = PEGI_LIMITS[plan];
    const pegiStr = movie.PegiRating || '';
    const pegi = parseInt(pegiStr.replace(/\D/g, ''), 10);
    return isNaN(pegi) ? true : pegi <= limite;
  }

  buscarPeliculas() {
    const termino = this.terminoBusqueda.toLowerCase();
    this.peliculasFiltradas = this.peliculas.filter(movie => {
      const coincideTitulo = (movie.title || '').toLowerCase().includes(termino);
      const coincideCategoria =
        this.categoriaSeleccionada === 'Todos' || movie.category === this.categoriaSeleccionada;
      const permitidoPorPEGI = this.puedeVerPelicula(movie);
      return coincideTitulo && coincideCategoria && permitidoPorPEGI;
    });
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.buscarPeliculas();
  }
  abrirAgregar() {
    if (this.adminPanel) {
      this.adminPanel.abrirAgregar();
    }
  }

  abrirEditar(movie: Movie) {
    if (this.adminPanel) {
      this.adminPanel.abrirEditar(movie);
    }
  }

  eliminar(movie: Movie) {
    if (this.adminPanel) {
      this.adminPanel.deleteMovie(movie);
    }
  }

  verDetalle(id: string) {
    const movie = this.peliculas.find(p => p.id === id);
    if (movie && !this.puedeVerPelicula(movie)) {
      this.messageService.showMessage('Tu plan no permite ver esta película por clasificación PEGI.', 'error');
      return;
    }
    this.router.navigate(['/detalle-pelicula'], { queryParams: { id } });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  onEditingChange(editing: boolean) {
    this.isEditingGlobal = editing;
  }

  ngOnDestroy() {}
}
