import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  private collectionRef;

  constructor(private firestore: Firestore) {
    this.collectionRef = collection(this.firestore, 'peliculas');
  }

  // Obtener todas las películas en tiempo real
  getMovies(): Observable<Movie[]> {
    return collectionData(this.collectionRef, { idField: 'id' }) as Observable<Movie[]>;
  }

  // Agregar una nueva película
  addMovie(movie: Movie) {
    return addDoc(this.collectionRef, movie);
  }

  // Actualizar una película existente
  updateMovie(id: string, movie: Partial<Movie>) {
    const docRef = doc(this.firestore, `peliculas/${id}`);
    return updateDoc(docRef, movie);
  }

  // Eliminar una película
  deleteMovie(id: string) {
    const docRef = doc(this.firestore, `peliculas/${id}`);
    return deleteDoc(docRef);
  }
}
