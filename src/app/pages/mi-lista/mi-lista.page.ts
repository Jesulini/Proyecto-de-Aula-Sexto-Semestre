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
  cargando = true;
  menuAbierto = false;
  activeRoute = '';

  constructor(private moviesService: MoviesService, private router: Router) {}

  async ngOnInit() {
    const uid = this.moviesService.getCurrentUid();
    if (!uid) return;
    try {
      this.peliculas = await this.moviesService.getMyList(uid);
      this.historial = await this.moviesService.getHistory(uid);
    } catch (err) {
      console.error('Error cargando datos de Mi Lista/Historial', err);
    } finally {
      this.cargando = false;
    }
  }

  verDetalles(pelicula: MovieForStore) {
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

  openMenu(routeName?: string) {
    this.menuAbierto = true;
    if (routeName) this.activeRoute = routeName;
  }

  closeMenu() {
    this.menuAbierto = false;
  }

  toggleMenu(routeName?: string) {
    this.menuAbierto = !this.menuAbierto;
    if (routeName) this.activeRoute = routeName;
  }

  setActiveRoute(routeName: string) {
    this.activeRoute = routeName;
  }

  isActiveRoute(routeName: string): boolean {
    return this.activeRoute === routeName;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
