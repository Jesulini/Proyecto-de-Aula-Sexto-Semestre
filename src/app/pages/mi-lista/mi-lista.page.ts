import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MoviesService } from 'src/app/services/movies/movies.service';
import { MovieForStore, MovieViewed } from 'src/app/models/movie-extended.model';

@Component({
  selector: 'app-mi-lista',
  templateUrl: './mi-lista.page.html',
  styleUrls: ['./mi-lista.page.scss'],
  standalone: false
})
export class MiListaPage implements OnInit {
  peliculas: MovieForStore[] = [];
  historial: MovieViewed[] = [];
  cargandoLista = true;
  cargandoHistorial = true;

  constructor(private moviesService: MoviesService, private router: Router) {}

  async ngOnInit() {
    const uid = this.moviesService.getCurrentUid();
    if (!uid) return;

    try {
      this.peliculas = await this.moviesService.getMyList(uid);
    } catch (err) {
      console.error('Error cargando Mi Lista', err);
    } finally {
      this.cargandoLista = false;
    }

    try {
      this.historial = await this.moviesService.getHistory(uid);
    } catch (err) {
      console.error('Error cargando Historial', err);
    } finally {
      this.cargandoHistorial = false;
    }
  }

  verDetalles(pelicula: MovieForStore | MovieViewed) {
    this.router.navigate(['/detalle-pelicula'], { queryParams: { id: pelicula.id } });
  }

  async eliminarPelicula(pelicula: MovieForStore) {
    const uid = this.moviesService.getCurrentUid();
    if (!uid) return;
    try {
      await this.moviesService.removeFromMyList(uid, pelicula);
      this.peliculas = this.peliculas.filter(p => p.id !== pelicula.id);
    } catch (err) {
      console.error('Error al eliminar de Mi Lista', err);
    }
  }

  async eliminarDelHistorial(pelicula: MovieViewed) {
    const uid = this.moviesService.getCurrentUid();
    if (!uid) return;
    try {
      await this.moviesService.removeFromHistory(uid, pelicula);
      this.historial = this.historial.filter(p => p.id !== pelicula.id);
    } catch (err) {
      console.error('Error al eliminar del historial', err);
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
