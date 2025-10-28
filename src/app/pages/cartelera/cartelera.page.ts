import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Movie } from 'src/app/models/movie.model';
import { AuthService } from 'src/app/services/auth';
import { Firestore, doc, getDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';

@Component({
  selector: 'app-cartelera',
  templateUrl: './cartelera.page.html',
  styleUrls: ['./cartelera.page.scss'],
  standalone: false,
})
export class CarteleraPage implements OnInit, OnDestroy {

  peliculas: Movie[] = [];
  peliculasFiltradas: Movie[] = [];
  categorias: string[] = ['Todos', 'Acción', 'Romance', 'Ciencia Ficción', 'Animación', 'Terror'];
  categoriaSeleccionada = 'Todos';
  terminoBusqueda = '';
  menuAbierto = false;

  esAdmin = false;
  modalAbierto = false;
  editando = false;
  peliculaTemp: Movie = { id: '', title: '', imageUrl: '', category: '', description: '' };

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    // Detectar si es admin
    const user = this.authService.getUser();
    const email = user?.email?.trim().toLowerCase() || '';
    this.esAdmin = email === 'jesulini14@gmail.com';

    // Cargar películas
    this.cargarPeliculas();
  }

  /** 🔁 Cargar películas desde el documento único */
  async cargarPeliculas() {
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Tipado seguro para evitar error TS
        const data = docSnap.data() as { items: Movie[] };
        this.peliculas = data.items || [];
        this.buscarPeliculas();
      }
    } catch (error) {
      console.error('Error cargando películas:', error);
    }
  }

  /** 🧠 Buscar películas */
  buscarPeliculas() {
    const termino = this.terminoBusqueda.toLowerCase();
    this.peliculasFiltradas = this.peliculas.filter(movie => {
      const coincideTitulo = movie.title?.toLowerCase().includes(termino);
      const coincideCategoria =
        this.categoriaSeleccionada === 'Todos' || movie.category === this.categoriaSeleccionada;
      return coincideTitulo && coincideCategoria;
    });
  }

  /** 🎭 Filtrar por categoría */
  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.buscarPeliculas();
  }

  /** 📱 Menú lateral */
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  /** ➕ Abrir modal agregar */
  abrirModalAgregar() {
    this.editando = false;
    this.peliculaTemp = { id: '', title: '', imageUrl: '', category: '', description: '' };
    this.modalAbierto = true;
  }

  /** ✏️ Abrir modal editar */
  abrirModalEditar(movie: Movie) {
    this.editando = true;
    this.peliculaTemp = { ...movie };
    this.modalAbierto = true;
  }

  /** ❌ Cerrar modal */
  cerrarModal() {
    this.modalAbierto = false;
  }

  /** 💾 Guardar o actualizar película en el arreglo del documento */
  async guardarPelicula() {
    const { title, imageUrl, category, description, id } = this.peliculaTemp;

    if (!title?.trim() || !imageUrl?.trim() || !category?.trim()) {
      alert('⚠️ Todos los campos son obligatorios.');
      return;
    }

    const docRef = doc(this.firestore, 'peliculas/peliculas');

    try {
      if (this.editando && id) {
        // Editar: reemplazamos el arreglo completo con la película actualizada
        this.peliculas = this.peliculas.map(p =>
          p.id === id ? { ...p, title, imageUrl, category, description } : p
        );
        await updateDoc(docRef, { items: this.peliculas });
        alert('✅ Película actualizada.');
      } else {
        // Agregar: generamos ID y usamos arrayUnion
        const nuevaPeli: Movie = { id: this.generarId(), title, imageUrl, category, description };
        await updateDoc(docRef, { items: arrayUnion(nuevaPeli) });
        this.peliculas.push(nuevaPeli); // actualizar localmente
        alert('🎬 Película agregada.');
      }

      this.cerrarModal();
      this.buscarPeliculas();
    } catch (error) {
      console.error('Error guardando película:', error);
      alert('❌ Error al guardar la película.');
    }
  }

  /** 🗑️ Eliminar película */
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
              alert('🗑️ Película eliminada.');
              this.buscarPeliculas();
            } catch (error) {
              console.error('Error eliminando película:', error);
              alert('❌ Error al eliminar la película.');
            }
          },
        },
      ],
    });

    await alerta.present();
  }

  /** 🚪 Cerrar sesión */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /** 🧹 Limpiar recursos */
  ngOnDestroy() {}

  /** 🔹 Generar ID aleatorio para películas */
  generarId() {
    return Math.random().toString(36).substring(2, 10);
  }
}
