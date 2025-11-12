import { Movie } from './movie.model';

export interface MovieViewed extends Movie {
  vistoEn: Date;
}

export type MovieForStore = Movie | MovieViewed;
