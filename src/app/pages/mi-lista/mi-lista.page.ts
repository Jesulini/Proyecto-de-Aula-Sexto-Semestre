import { Component, OnInit } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, arrayRemove } from '@angular/fire/firestore';
import { AuthService, User } from '../../services/auth';
import { Movie } from '../../models/movie.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-mi-lista',
  templateUrl: './mi-lista.page.html',
  styleUrls: ['./mi-lista.page.scss'],
  standalone: false,
})
export class MiListaPage implements OnInit {

  usuarioActual: User | null = null;
  peliculas: Movie[] = [];

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.usuarioActual = this.authService.getUsuarioActual();
    if (this.usuarioActual) {
      await this.cargarMiLista();
    }

    // Suscribirse a cambios de usuario
    this.authService.usuarioActual$().subscribe(async usuario => {
      this.usuarioActual = usuario;
      if (usuario) {
        await this.cargarMiLista();
      } else {
        this.peliculas = [];
      }
    });
  }

  async cargarMiLista() {
    if (!this.usuarioActual) return;

    try {
      const listaRef = doc(this.firestore, `usuarios/${this.usuarioActual.uid}/mi-lista/lista`);
      const snap = await getDoc(listaRef);

      if (snap.exists()) {
        const data = snap.data() as { items: Movie[] };
        this.peliculas = data.items || [];
      } else {
        this.peliculas = [];
      }
    } catch (e) {
      console.error('Error cargando Mi Lista', e);
      this.peliculas = [];
    }
  }

  async eliminarPelicula(pelicula: Movie) {
    if (!this.usuarioActual) return;

    try {
      const listaRef = doc(this.firestore, `usuarios/${this.usuarioActual.uid}/mi-lista/lista`);
      await updateDoc(listaRef, { items: arrayRemove(pelicula) });
      this.peliculas = this.peliculas.filter(p => p.id !== pelicula.id);
      this.showToast('Película eliminada de Mi Lista');
    } catch (e) {
      console.error('Error eliminando película', e);
      this.showToast('Error al eliminar película 😢');
    }
  }

  verTrailer(trailerUrl?: string) {
    if (!trailerUrl) return;
    window.open(trailerUrl, '_blank');
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000, position: 'bottom' });
    toast.present();
  }
}
