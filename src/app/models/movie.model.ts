export interface Movie {
  id: string;
  title: string;
  imageUrl: string;
  movieUrl?: string;
  trailerUrl?: string;
  category?: string;
  AgeRating?: string;
  description?: string;
  ParaTodosOAdultos?: string;
  PegiRating?: string;
  isLoading?: boolean;
}
