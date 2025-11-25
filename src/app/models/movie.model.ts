export interface Movie {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
  description?: string;
  trailerUrl?: string;
  movieUrl?: string;
  AgeRating?: string;
  ParaTodosOAdultos?: string;
  PegiRating?: string;
  isLoading?: boolean;
}
