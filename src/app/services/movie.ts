import { Injectable } from '@angular/core';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private movies: Movie[] = [
    { id: '1', title: 'Inception', imageUrl: 'assets/inception.jpg' },
    { id: '2', title: 'Interstellar', imageUrl: 'assets/interstellar.jpg' },
    { id: '3', title: 'The Dark Knight', imageUrl: 'assets/dark-knight.jpg' },
    { id: '4', title: 'Tenet', imageUrl: 'assets/tenet.jpg' },
  ];

  constructor() {}

  getMovies() {
    return this.movies;
  }

  updateMovies(updatedList: Movie[]) {
    this.movies = [...updatedList];
  }
}
