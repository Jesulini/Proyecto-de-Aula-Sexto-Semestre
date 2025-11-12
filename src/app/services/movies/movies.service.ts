import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
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
    try {
      const ref = doc(this.firestore, 'peliculas/peliculas');
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      const data = snap.data() as FirestoreItems<Movie>;
      return data.items.find(p => p.id === id) || null;
    } catch (err) {
      console.error('MoviesService.cargarMovieById error', err);
      throw err;
    }
  }

  async isInMyList(uid: string, movieId: string): Promise<boolean> {
    try {
      const ref = doc(this.firestore, `usuarios/${uid}/mi-lista/lista`);
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;
      const data = snap.data() as FirestoreItems<MovieForStore>;
      return data.items.some(p => p.id === movieId);
    } catch (err) {
      console.error('MoviesService.isInMyList error', err);
      throw err;
    }
  }

  async addToMyList(uid: string, movie: MovieForStore): Promise<void> {
    try {
      const ref = doc(this.firestore, `usuarios/${uid}/mi-lista/lista`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { items: arrayUnion(movie) });
      } else {
        await setDoc(ref, { items: [movie] });
      }
    } catch (err) {
      console.error('MoviesService.addToMyList error', err);
      throw err;
    }
  }

  async removeFromMyList(uid: string, movie: MovieForStore): Promise<void> {
    try {
      const ref = doc(this.firestore, `usuarios/${uid}/mi-lista/lista`);
      await updateDoc(ref, { items: arrayRemove(movie) });
    } catch (err) {
      console.error('MoviesService.removeFromMyList error', err);
      throw err;
    }
  }

  async getMyList(uid: string): Promise<MovieForStore[]> {
    try {
      const ref = doc(this.firestore, `usuarios/${uid}/mi-lista/lista`);
      const snap = await getDoc(ref);
      if (!snap.exists()) return [];
      const data = snap.data() as FirestoreItems<MovieForStore>;
      return data.items || [];
    } catch (err) {
      console.error('MoviesService.getMyList error', err);
      throw err;
    }
  }

  async registerHistory(uid: string, movie: Movie): Promise<void> {
    try {
      const historialRef = doc(this.firestore, `usuarios/${uid}/historial/vistas`);
      const snap = await getDoc(historialRef);
      const movieViewed: MovieViewed = { ...movie, vistoEn: new Date() };

      if (snap.exists()) {
        const data = snap.data() as FirestoreItems<MovieViewed>;
        const exists = data.items.some(p => p.id === movie.id);
        if (!exists) {
          await updateDoc(historialRef, { items: arrayUnion(movieViewed) });
        }
      } else {
        await setDoc(historialRef, { items: [movieViewed] });
      }

      await this.syncHistoryWithMyList(uid, movieViewed);
    } catch (err) {
      console.error('MoviesService.registerHistory error', err);
      throw err;
    }
  }

  async syncHistoryWithMyList(uid: string, movieViewed: MovieViewed): Promise<void> {
    try {
      const ref = doc(this.firestore, `usuarios/${uid}/mi-lista/historial`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as FirestoreItems<MovieViewed>;
        const exists = data.items.some(p => p.id === movieViewed.id);
        if (!exists) {
          await updateDoc(ref, { items: arrayUnion(movieViewed) });
        }
      } else {
        await setDoc(ref, { items: [movieViewed] });
      }
    } catch (err) {
      console.error('MoviesService.syncHistoryWithMyList error', err);
      throw err;
    }
  }

  async getHistory(uid: string): Promise<MovieViewed[]> {
    try {
      const ref = doc(this.firestore, `usuarios/${uid}/historial/vistas`);
      const snap = await getDoc(ref);
      if (!snap.exists()) return [];
      const data = snap.data() as FirestoreItems<MovieViewed>;
      return data.items || [];
    } catch (err) {
      console.error('MoviesService.getHistory error', err);
      throw err;
    }
  }

  async removeFromHistory(uid: string, movie: MovieViewed): Promise<void> {
    try {
      const ref = doc(this.firestore, `usuarios/${uid}/historial/vistas`);
      await updateDoc(ref, { items: arrayRemove(movie) });
    } catch (err) {
      console.error('MoviesService.removeFromHistory error', err);
      throw err;
    }
  }

  getCurrentUid(): string | null {
    const user = this.authService.getUsuarioActual();
    return user ? user.uid : null;
  }
}
