import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Movie } from 'src/app/models/movie.model';
import { MovieViewed, MovieForStore } from 'src/app/models/movie-extended.model';
import { AuthService } from 'src/app/services/auth/auth';
import { FirestoreItems } from 'src/app/models/firestore-items.model';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  async cargarMovieById(id: string): Promise<Movie | null> {
    const ref = doc(this.firestore, 'peliculas', id);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Movie) : null;
  }

  async cargarTodas(): Promise<Movie[]> {
    const colRef = collection(this.firestore, 'peliculas');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as Movie);
  }

  async agregarPelicula(movie: Movie): Promise<void> {
    const colRef = collection(this.firestore, 'peliculas');
    const ref = doc(colRef, movie.id);
    await setDoc(ref, movie);
  }

  async actualizarPelicula(movie: Movie): Promise<void> {
    const ref = doc(this.firestore, 'peliculas', movie.id);
    await setDoc(ref, movie, { merge: true });
  }

  async eliminarPelicula(movieId: string): Promise<void> {
    const ref = doc(this.firestore, 'peliculas', movieId);
    await deleteDoc(ref);
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
      await setDoc(ref, { items: [...(snap.data() as FirestoreItems<MovieForStore>).items, movie] }, { merge: true });
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
    await setDoc(ref, { items: nuevaLista }, { merge: true });
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
        await setDoc(historialRef, { items: [...data.items, movieViewed] }, { merge: true });
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
        await setDoc(ref, { items: [...data.items, movieViewed] }, { merge: true });
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
    await setDoc(ref, { items: nuevaLista }, { merge: true });
  }

  getCurrentUid(): string | null {
    const user = this.authService.getUsuarioActual();
    return user ? user.uid : null;
  }
}
