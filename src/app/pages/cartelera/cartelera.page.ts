import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Movie } from 'src/app/models/movie.model';
import { AuthService } from 'src/app/services/auth/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { MessageService } from 'src/app/services/message.service';
import { SubscriptionService } from 'src/app/services/subscription.service';

const PEGI_LIMITS: Record<string, number> = {
  gratis: 3,
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

  peliculas: Movie[] = [];
  peliculasFiltradas: Movie[] = [];
  categorias: string[] = ['Todos', 'Acción', 'Romance', 'Ciencia Ficción', 'Animación', 'Terror'];
  categoriaSeleccionada = 'Todos';
  terminoBusqueda = '';

  esAdmin = false;
  modalAbierto = false;
  editando = false;

  currentPlan: string = 'gratis';

  peliculaTemp: Movie = {
    id: '',
    title: '',
    imageUrl: '',
    category: '',
    description: '',
    trailerUrl: '',
    movieUrl: '',
    PegiRating: ''
  };

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private firestore: Firestore,
    private messageService: MessageService,
    private subscriptionService: SubscriptionService
  ) {}

  async ngOnInit() {
    const user = this.authService.getUsuarioActual();
    const email = user?.email?.trim().toLowerCase() || '';
    this.esAdmin = email === 'jesulini14@gmail.com';

    if (user) {
      const subs = await this.subscriptionService.getSubscription(user.uid);
      this.currentPlan = subs?.subscriptionType || 'gratis';
    }

    this.cargarPeliculas();
  }

  async cargarPeliculas() {
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { items: Movie[] };
        this.peliculas = data.items || [];
        this.buscarPeliculas();
      }
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

  abrirModalAgregar() {
    this.editando = false;
    this.peliculaTemp = {
      id: '',
      title: '',
      imageUrl: '',
      category: '',
      description: '',
      trailerUrl: '',
      movieUrl: '',
      PegiRating: ''
    };
    this.modalAbierto = true;
  }

  abrirModalEditar(movie: Movie) {
    this.editando = true;
    this.peliculaTemp = { ...movie };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  async guardarPelicula() {
    const { title, imageUrl, category, description, trailerUrl, movieUrl, id, PegiRating } = this.peliculaTemp;

    if (!title?.trim() || !imageUrl?.trim() || !category?.trim() || !PegiRating?.trim()) {
      this.messageService.showMessage('Todos los campos obligatorios deben estar completos.', 'error');
      return;
    }

    const docRef = doc(this.firestore, 'peliculas/peliculas');

    try {
      if (this.editando && id) {
        this.peliculas = this.peliculas.map(p =>
          p.id === id ? { ...p, title, imageUrl, category, description, trailerUrl, movieUrl, PegiRating } : p
        );
        await updateDoc(docRef, { items: this.peliculas });
        this.messageService.showMessage('Película actualizada correctamente.', 'success');
      } else {
        const nuevaPeli: Movie = {
          id: this.generarId(),
          title,
          imageUrl,
          category,
          description,
          trailerUrl,
          movieUrl,
          PegiRating
        };
        this.peliculas.push(nuevaPeli);
        await updateDoc(docRef, { items: this.peliculas });
        this.messageService.showMessage('Película agregada exitosamente.', 'success');
      }

      this.cerrarModal();
      this.buscarPeliculas();
    } catch (error) {
      console.error('Error guardando película:', error);
      this.messageService.showMessage('Error al guardar la película.', 'error');
    }
  }

  async confirmarEliminacion(id: string) {
    const alerta = await this.alertCtrl.create({
      header: 'Eliminar película',
      message: '¿Seguro que deseas eliminar esta película?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              this.peliculas = this.peliculas.filter(p => p.id !== id);
              const docRef = doc(this.firestore, 'peliculas/peliculas');
              await updateDoc(docRef, { items: this.peliculas });
              this.messageService.showMessage('Película eliminada.', 'success');
              this.buscarPeliculas();
            } catch (error) {
              console.error('Error eliminando película:', error);
              this.messageService.showMessage('Error al eliminar la película.', 'error');
            }
          }
        }
      ]
    });

    await alerta.present();
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

  ngOnDestroy() {}

  generarId() {
    return Math.random().toString(36).substring(2, 10);
  }
}
