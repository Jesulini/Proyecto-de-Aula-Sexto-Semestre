export interface Movie {
  id: string;             // obligatorio
  title: string;          // obligatorio
  imageUrl: string;       // obligatorio
  movieUrl?: string;
  trailerUrl?: string;
  category?: string;
  description?: string;
  vistoEn?: any;
}
