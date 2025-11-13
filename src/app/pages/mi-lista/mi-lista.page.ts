import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MoviesService } from 'src/app/services/movies/movies.service';
import { MovieForStore, MovieViewed } from 'src/app/models/movie-extended.model';
import { MessageService } from 'src/app/services/message.service';
import { mapFirebaseError } from 'src/app/utils/error-utils';

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

  constructor(
    private moviesService: MoviesService,
    private router: Router,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    const uid = this.moviesService.getCurrentUid();
    if (!uid) return;

    try {
      const [lista, historial] = await Promise.all([
        this.moviesService.getMyList(uid),
        this.moviesService.getHistory(uid)
      ]);

      this.peliculas = lista;
      this.historial = historial;
    } catch (err) {
      const msg = mapFirebaseError(err || { code: 'cargar-mi-lista' });
      this.messageService.showMessage(msg, 'error');
    } finally {
      this.cargandoLista = false;
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
      this.messageService.showMessage('Película eliminada de Mi Lista.', 'success');
    } catch (err) {
      const msg = mapFirebaseError(err || { code: 'eliminar-mi-lista' });
      this.messageService.showMessage(msg, 'error');
    }
  }

  async eliminarDelHistorial(pelicula: MovieViewed) {
    const uid = this.moviesService.getCurrentUid();
    if (!uid) return;
    try {
      await this.moviesService.removeFromHistory(uid, pelicula);
      this.historial = this.historial.filter(p => p.id !== pelicula.id);
      this.messageService.showMessage('Película eliminada del historial.', 'success');
    } catch (err) {
      const msg = mapFirebaseError(err || { code: 'eliminar-historial' });
      this.messageService.showMessage(msg, 'error');
    }
  }

  logout() {
    this.router.navigate(['/login']);
    this.messageService.showMessage('Sesión cerrada correctamente.', 'info');
  }

  trackById(index: number, item: MovieForStore | MovieViewed) {
    return item.id;
  }
}
