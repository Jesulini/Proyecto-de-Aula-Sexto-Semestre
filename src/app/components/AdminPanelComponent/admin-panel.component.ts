import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Movie } from 'src/app/models/movie.model';
import { MessageService } from 'src/app/services/message.service';
import { mapFirebaseError } from 'src/app/utils/error-utils';


@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
  standalone: false
})
export class AdminPanelComponent implements OnInit {
  @Output() editingChange = new EventEmitter<boolean>();

  peliculas: Movie[] = [];
  categorias: string[] = ['Acción', 'Romance', 'Ciencia Ficción', 'Animación', 'Terror'];
  isAdmin = false;

  isEditing = false;
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

  constructor(
    private firestore: Firestore,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  async loadMovies(): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { items?: Movie[] };
        this.peliculas = (data.items || []).map(m => ({
          ...m,
          AgeRating: m.AgeRating || '',
          ParaTodosOAdultos: m.ParaTodosOAdultos || '',
          PegiRating: m.PegiRating || '',
          isLoading: false
        }));
        console.log('Películas detectadas en AdminPanel:', this.peliculas.length, this.peliculas);
      } else {
        console.warn('No existe el documento peliculas/peliculas en Firestore');
        this.peliculas = [];
      }
    } catch (error: any) {
      console.error('Error al cargar películas:', error);
      const msg = mapFirebaseError(error);
      this.messageService.showMessage(msg, 'error');
    }
  }

  abrirAgregar(): void {
    this.editando = false;
    this.isEditing = true;
    this.editingChange.emit(true);
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
  }

  abrirEditar(movie: Movie): void {
    this.editando = true;
    this.isEditing = true;
    this.editingChange.emit(true);
    this.peliculaTemp = {
      ...movie,
      AgeRating: movie.AgeRating || '',
      ParaTodosOAdultos: movie.ParaTodosOAdultos || '',
      PegiRating: movie.PegiRating || ''
    };
  }

  cancelarEdicion(): void {
    this.isEditing = false;
    this.editingChange.emit(false);
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
        this.peliculas = this.peliculas.map(p =>
          p.id === id ? { ...p, title, imageUrl, category, description, trailerUrl, movieUrl, AgeRating, ParaTodosOAdultos, PegiRating } : p
        );
        await setDoc(docRef, { items: this.peliculas }, { merge: true });
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
          isLoading: false
        };
        this.peliculas.push(nuevaPeli);
        await setDoc(docRef, { items: this.peliculas }, { merge: true });
        this.messageService.showMessage('Película agregada.', 'success');
      }
      this.cancelarEdicion();
      this.loadMovies();
    } catch (error: any) {
      console.error('Error al guardar película:', error);
      const msg = mapFirebaseError(error);
      this.messageService.showMessage(msg, 'error');
    }
  }

  async deleteMovie(movie: Movie): Promise<void> {
    this.peliculas = this.peliculas.filter(p => p.id !== movie.id);
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      await setDoc(docRef, { items: this.peliculas }, { merge: true });
      this.messageService.showMessage('Película eliminada.', 'success');
      this.loadMovies();
    } catch (error: any) {
      console.error('Error al eliminar película:', error);
      const msg = mapFirebaseError(error);
      this.messageService.showMessage(msg, 'error');
    }
  }

  generarId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
