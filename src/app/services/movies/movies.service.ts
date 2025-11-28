import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Movie } from 'src/app/models/movie.model';
import { FirestoreItems } from 'src/app/models/firestore-items.model';
import { MovieViewed, MovieForStore } from 'src/app/models/movie-extended.model';
import { AuthService } from 'src/app/services/auth/auth';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  async cargarMovieById(id: string): Promise<Movie | null> {
    const ref = doc(this.firestore, 'peliculas/peliculas');
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as FirestoreItems<Movie>;
    return data.items.find(p => p.id === id) || null;
  }

  async cargarTodas(): Promise<Movie[]> {
    const ref = doc(this.firestore, 'peliculas/peliculas');
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    const data = snap.data() as FirestoreItems<Movie>;
    return data.items || [];
  }

  async guardarPeliculas(movies: Movie[]): Promise<void> {
    const ref = doc(this.firestore, 'peliculas/peliculas');
    await updateDoc(ref, { items: movies });
  }

  async agregarPelicula(movie: Movie, movies: Movie[]): Promise<Movie[]> {
    const nuevaLista = [...movies, movie];
    await this.guardarPeliculas(nuevaLista);
    return nuevaLista;
  }

  async actualizarPelicula(movie: Movie, movies: Movie[]): Promise<Movie[]> {
    const nuevaLista = movies.map(p => p.id === movie.id ? movie : p);
    await this.guardarPeliculas(nuevaLista);
    return nuevaLista;
  }

  async eliminarPelicula(movieId: string, movies: Movie[]): Promise<Movie[]> {
    const nuevaLista = movies.filter(p => p.id !== movieId);
    await this.guardarPeliculas(nuevaLista);
    return nuevaLista;
  }

  async isInMyList(uid: string, movieId: string): Promise<boolean> {
    const ref = doc(this.firestore, `usuarios/${uid}/mi-lista/lista`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const data = snap.data() as FirestoreItems<MovieForStore>;
    return data.items.some(p => p.id === movieId);
  }

  async addToMyList(uid: string, movie: MovieForStore): Promise<void> {
    const ref = doc(this.firestore, `usuarios/${uid}/mi-lista/lista`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { items: [...(snap.data() as FirestoreItems<MovieForStore>).items, movie] });
    } else {
      await setDoc(ref, { items: [movie] });
    }
  }

  async removeFromMyList(uid: string, movie: MovieForStore): Promise<void> {
    const ref = doc(this.firestore, `usuarios/${uid}/mi-lista/lista`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as FirestoreItems<MovieForStore>;
    const nuevaLista = data.items.filter(p => p.id !== movie.id);
    await updateDoc(ref, { items: nuevaLista });
  }

  async getMyList(uid: string): Promise<MovieForStore[]> {
    const ref = doc(this.firestore, `usuarios/${uid}/mi-lista/lista`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    const data = snap.data() as FirestoreItems<MovieForStore>;
    return data.items || [];
  }

  async registerHistory(uid: string, movie: Movie): Promise<void> {
    const historialRef = doc(this.firestore, `usuarios/${uid}/historial/vistas`);
    const snap = await getDoc(historialRef);
    const movieViewed: MovieViewed = { ...movie, vistoEn: new Date() };

    if (snap.exists()) {
      const data = snap.data() as FirestoreItems<MovieViewed>;
      const exists = data.items.some(p => p.id === movie.id);
      if (!exists) {
        await updateDoc(historialRef, { items: [...data.items, movieViewed] });
      }
    } else {
      await setDoc(historialRef, { items: [movieViewed] });
    }

    await this.syncHistoryWithMyList(uid, movieViewed);
  }

  async syncHistoryWithMyList(uid: string, movieViewed: MovieViewed): Promise<void> {
    const ref = doc(this.firestore, `usuarios/${uid}/mi-lista/historial`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as FirestoreItems<MovieViewed>;
      const exists = data.items.some(p => p.id === movieViewed.id);
      if (!exists) {
        await updateDoc(ref, { items: [...data.items, movieViewed] });
      }
    } else {
      await setDoc(ref, { items: [movieViewed] });
    }
  }

  async getHistory(uid: string): Promise<MovieViewed[]> {
    const ref = doc(this.firestore, `usuarios/${uid}/historial/vistas`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    const data = snap.data() as FirestoreItems<MovieViewed>;
    return data.items || [];
  }

  async removeFromHistory(uid: string, movie: MovieViewed): Promise<void> {
    const ref = doc(this.firestore, `usuarios/${uid}/historial/vistas`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as FirestoreItems<MovieViewed>;
    const nuevaLista = data.items.filter(p => p.id !== movie.id);
    await updateDoc(ref, { items: nuevaLista });
  }

  getCurrentUid(): string | null {
    const user = this.authService.getUsuarioActual();
    return user ? user.uid : null;
  }
}
