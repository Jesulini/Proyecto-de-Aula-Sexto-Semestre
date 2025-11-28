import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDocs, setDoc, deleteDoc } from '@angular/fire/firestore';
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
      const colRef = collection(this.firestore, 'peliculas');
      const snap = await getDocs(colRef);
      this.peliculas = snap.docs.map(d => {
  const m = d.data() as Movie;
  const { id, ...rest } = m; 
  return {
    id: d.id,
    ...rest,
    AgeRating: m.AgeRating || '',
    ParaTodosOAdultos: m.ParaTodosOAdultos || '',
    PegiRating: m.PegiRating || '',
    isLoading: false
  };
});

    } catch (error: any) {
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
      const colRef = collection(this.firestore, 'peliculas');
      const peliId = this.editando && id ? id : doc(colRef).id;
      const nuevaPeli: Movie = {
        id: peliId,
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
      await setDoc(doc(colRef, peliId), nuevaPeli, { merge: true });
      this.messageService.showMessage(this.editando ? 'Película actualizada.' : 'Película agregada.', 'success');
      this.cancelarEdicion();
      this.loadMovies();
    } catch (error: any) {
      const msg = mapFirebaseError(error);
      this.messageService.showMessage(msg, 'error');
    }
  }

  async deleteMovie(movie: Movie): Promise<void> {
    try {
      const colRef = collection(this.firestore, 'peliculas');
      await deleteDoc(doc(colRef, movie.id));
      this.messageService.showMessage('Película eliminada.', 'success');
      this.loadMovies();
    } catch (error: any) {
      const msg = mapFirebaseError(error);
      this.messageService.showMessage(msg, 'error');
    }
  }
}
