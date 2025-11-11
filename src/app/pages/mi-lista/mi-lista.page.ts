import { Component, OnInit } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, arrayRemove } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService, User } from 'src/app/services/auth/auth';
import { Movie } from 'src/app/models/movie.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-mi-lista',
  templateUrl: './mi-lista.page.html',
  styleUrls: ['./mi-lista.page.scss'],
  standalone: false,
})
export class MiListaPage implements OnInit {

  usuario: User | null = null;
  peliculas: Movie[] = [];
  historial: Movie[] = [];
  menuAbierto = false;
  cargando = true;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    public router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.usuario = this.authService.getUsuarioActual();
    if (this.usuario) {
      await this.cargarMiLista();
      await this.cargarHistorial(); // Solo se muestra, ya no se modifica aquí
    }
    this.cargando = false;
  }

  // 🔹 Cargar Mi Lista
  async cargarMiLista() {
    try {
      const ref = doc(this.firestore, `usuarios/${this.usuario?.uid}/mi-lista/lista`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        this.peliculas = (snap.data() as { items: Movie[] }).items || [];
      }
    } catch (e) {
      console.error('Error cargando Mi Lista', e);
    }
  }

  // 🔹 Cargar historial (solo lectura)
  async cargarHistorial() {
    try {
      const ref = doc(this.firestore, `usuarios/${this.usuario?.uid}/historial/lista`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        this.historial = (snap.data() as { items: Movie[] }).items || [];
      }
    } catch (e) {
      console.error('Error cargando historial', e);
    }
  }

  // 🔹 Ver detalles de película (el historial se maneja desde detalle-pelicula.page.ts)
  verDetalles(pelicula: Movie) {
    this.router.navigate(['/detalle-pelicula'], { queryParams: { id: pelicula.id } });
  }

  // 🔹 Eliminar película de la lista
  async eliminarPelicula(pelicula: Movie) {
    if (!this.usuario) return;

    const ref = doc(this.firestore, `usuarios/${this.usuario.uid}/mi-lista/lista`);
    try {
      await updateDoc(ref, { items: arrayRemove(pelicula) });
      this.peliculas = this.peliculas.filter(p => p.id !== pelicula.id);
      this.showToast('Película eliminada de tu lista ❌');
    } catch (e) {
      console.error('Error al eliminar película', e);
      this.showToast('Error al eliminar la película 😢');
    }
  }

  // 🔹 Notificación visual
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
