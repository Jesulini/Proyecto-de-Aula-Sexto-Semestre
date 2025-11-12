import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Movie } from 'src/app/models/movie.model';
import { AuthService, User } from 'src/app/services/auth/auth';
import { ToastController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MoviesService } from 'src/app/services/movies/movies.service';

@Component({
  selector: 'app-detalle-pelicula',
  templateUrl: './detalle-pelicula.page.html',
  styleUrls: ['./detalle-pelicula.page.scss'],
  standalone: false,
})
export class DetallePeliculaPage implements OnInit {
  pelicula: Movie | null = null;
  peliculaId: string | null = null;
  enMiLista = false;
  trailerAbierto = false;
  peliculaAbierta = false;

  constructor(
    private route: ActivatedRoute,
    private moviesService: MoviesService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    this.peliculaId = this.route.snapshot.queryParamMap.get('id');
    if (this.peliculaId) {
      await this.loadPelicula(this.peliculaId);
      const usuario = this.authService.getUsuarioActual();
      if (usuario && this.pelicula) {
        await this.checkMiLista(usuario.uid);
      }
    }
  }

  private async loadPelicula(id: string) {
    try {
      this.pelicula = await this.moviesService.cargarMovieById(id);
    } catch (e) {
      console.error('Error cargando película', e);
    }
  }

  private async checkMiLista(uid: string) {
    try {
      if (!this.pelicula) {
        this.enMiLista = false;
        return;
      }
      this.enMiLista = await this.moviesService.isInMyList(uid, this.pelicula.id);
    } catch (e) {
      console.error('Error verificando Mi Lista', e);
      this.enMiLista = false;
    }
  }

  async toggleMiLista() {
    const usuario: User | null = this.authService.getUsuarioActual();
    if (!usuario || !this.pelicula) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      if (this.enMiLista) {
        await this.moviesService.removeFromMyList(usuario.uid, this.pelicula);
        this.enMiLista = false;
        this.showToast('Película removida de Mi Lista');
      } else {
        await this.moviesService.addToMyList(usuario.uid, this.pelicula);
        this.enMiLista = true;
        this.showToast('Película agregada a Mi Lista');
      }
    } catch (e) {
      console.error('Error modificando Mi Lista', e);
      this.showToast('Error al modificar Mi Lista');
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  abrirTrailer() {
    this.trailerAbierto = true;
  }

  cerrarTrailer() {
    this.trailerAbierto = false;
  }

  async abrirPelicula() {
    this.peliculaAbierta = true;
    const usuario: User | null = this.authService.getUsuarioActual();
    if (usuario && this.pelicula) {
      try {
        await this.moviesService.registerHistory(usuario.uid, this.pelicula);
      } catch (e) {
        console.error('Error registrando en historial', e);
      }
    }
  }

  cerrarPelicula() {
    this.peliculaAbierta = false;
  }

  esVideoArchivo(url?: string | null): boolean {
    if (!url) return false;
    return /\.(mp4|webm|ogg)$/i.test(url);
  }

  getSafeTrailerUrl(url?: string | null): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1].split('&')[0];
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${id}?autoplay=1`
      );
    } else if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${id}?autoplay=1`
      );
    } else if (url.includes('vimeo.com')) {
      const id = url.split('vimeo.com/')[1];
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://player.vimeo.com/video/${id}?autoplay=1`
      );
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
