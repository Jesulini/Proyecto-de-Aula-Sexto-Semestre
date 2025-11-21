import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Movie } from 'src/app/models/movie.model';
import { AuthService } from 'src/app/services/auth/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';

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
    PegiRating: ''
  };

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    const user = this.authService.getUsuarioActual();
    const email = user?.email?.trim().toLowerCase() || '';

    this.esAdmin = email === 'jesulini14@gmail.com';
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

  buscarPeliculas() {
    const termino = this.terminoBusqueda.toLowerCase();
    this.peliculasFiltradas = this.peliculas.filter(movie => {
      const coincideTitulo = (movie.title || '').toLowerCase().includes(termino);
      const coincideCategoria =
        this.categoriaSeleccionada === 'Todos' || movie.category === this.categoriaSeleccionada;
      return coincideTitulo && coincideCategoria;
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
      AgeRating: '',
      ParaTodosOAdultos: '',
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
    const {
      title, imageUrl, category, description, trailerUrl,
      movieUrl, AgeRating, ParaTodosOAdultos, PegiRating, id
    } = this.peliculaTemp;

    if (!title?.trim() || !imageUrl?.trim() || !category?.trim()) {
      alert('Todos los campos obligatorios deben estar completos.');
      return;
    }

    const docRef = doc(this.firestore, 'peliculas/peliculas');

    try {
      if (this.editando && id) {
        this.peliculas = this.peliculas.map(p =>
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

        await updateDoc(docRef, { items: this.peliculas });
        alert('Película actualizada correctamente.');
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
          PegiRating
        };

        this.peliculas.push(nuevaPeli);
        await updateDoc(docRef, { items: this.peliculas });

        alert('Película agregada exitosamente.');
      }

      this.cerrarModal();
      this.buscarPeliculas();
    } catch (error) {
      console.error('Error guardando película:', error);
      alert('Error al guardar la película.');
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
              alert('Película eliminada.');
              this.buscarPeliculas();
            } catch (error) {
              console.error('Error eliminando película:', error);
              alert('Error al eliminar la película.');
            }
          }
        }
      ]
    });

    await alerta.present();
  }

  verDetalle(id: string) {
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
