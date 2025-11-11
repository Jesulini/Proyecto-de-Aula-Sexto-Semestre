import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { Movie } from 'src/app/models/movie.model';
import { AuthService, User } from 'src/app/services/auth/auth';
import { ToastController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-detalle-pelicula',
  templateUrl: './detalle-pelicula.page.html',
  styleUrls: ['./detalle-pelicula.page.scss'],
  standalone: false,
})
export class DetallePeliculaPage implements OnInit {

  pelicula: Movie | null = null;
  peliculaId: string | null = null;
  menuAbierto = false;
  enMiLista = false;

  // Modales
  trailerAbierto = false;
  peliculaAbierta = false;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    this.peliculaId = this.route.snapshot.queryParamMap.get('id');
    if (this.peliculaId) {
      await this.cargarPelicula(this.peliculaId);
      await this.checkMiLista();

      // ✅ Registrar película en el historial cuando el usuario entra al detalle
      if (this.pelicula) {
        await this.registrarEnHistorial(this.pelicula);
      }
    }
  }

  // 🔹 Cargar película desde Firestore
  async cargarPelicula(id: string) {
    try {
      const ref = doc(this.firestore, 'peliculas/peliculas');
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as { items: Movie[] };
        this.pelicula = data.items.find(p => p.id === id) || null;
      }
    } catch (e) {
      console.error('Error cargando película', e);
    }
  }

  // 🔹 Registrar película vista en el historial del usuario
  private async registrarEnHistorial(pelicula: Movie) {
    const usuario: User | null = this.authService.getUsuarioActual();
    if (!usuario) return;

    try {
      const historialRef = doc(this.firestore, `usuarios/${usuario.uid}/historial/vistas`);
      const snap = await getDoc(historialRef);

      // Añadimos fecha de visualización
      const peliculaVista = { ...pelicula, vistoEn: new Date() };

      if (snap.exists()) {
        const data = snap.data() as { items: Movie[] };
        const yaExiste = data.items.some(p => p.id === pelicula.id);
        if (!yaExiste) {
          await updateDoc(historialRef, { items: arrayUnion(peliculaVista) });
          console.log('✅ Película agregada al historial:', pelicula.title);
        }
      } else {
        await setDoc(historialRef, { items: [peliculaVista] });
        console.log('✅ Historial creado con la primera película:', pelicula.title);
      }

      // 👇 Reflejar el historial también en la colección "mi-lista/historial"
      await this.actualizarHistorialEnMiLista(usuario.uid, peliculaVista);

    } catch (e) {
      console.error('Error registrando en historial', e);
    }
  }

  // 🔹 Reflejar el historial en la colección "mi-lista/historial"
  private async actualizarHistorialEnMiLista(uid: string, peliculaVista: any) {
    try {
      const historialMiListaRef = doc(this.firestore, `usuarios/${uid}/mi-lista/historial`);
      const snap = await getDoc(historialMiListaRef);

      if (snap.exists()) {
        const data = snap.data() as { items: Movie[] };
        const yaExiste = data.items.some(p => p.id === peliculaVista.id);
        if (!yaExiste) {
          await updateDoc(historialMiListaRef, { items: arrayUnion(peliculaVista) });
        }
      } else {
        await setDoc(historialMiListaRef, { items: [peliculaVista] });
      }
    } catch (e) {
      console.error('Error sincronizando historial con Mi Lista', e);
    }
  }

  // 🔹 Abrir y cerrar modales
  abrirTrailer() { this.trailerAbierto = true; }
  cerrarTrailer() { this.trailerAbierto = false; }

  abrirPelicula() { this.peliculaAbierta = true; }
  cerrarPelicula() { this.peliculaAbierta = false; }

  // 🔹 Detecta si es archivo de video local
  esVideoArchivo(url?: string | null): boolean {
    if (!url) return false;
    return /\.(mp4|webm|ogg)$/i.test(url);
  }

  // 🔹 Convierte URLs a formato embed seguro
  getSafeTrailerUrl(url?: string | null): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');

    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1].split('&')[0];
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}?autoplay=1`);
    } else if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}?autoplay=1`);
    } else if (url.includes('vimeo.com')) {
      const id = url.split('vimeo.com/')[1];
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.vimeo.com/video/${id}?autoplay=1`);
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // 🔹 Verifica si está en Mi Lista
  private async checkMiLista() {
    const usuario: User | null = this.authService.getUsuarioActual();
    if (!usuario || !this.pelicula) return;

    try {
      const miListaDocRef = doc(this.firestore, `usuarios/${usuario.uid}/mi-lista/lista`);
      const docSnap = await getDoc(miListaDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as { items: Movie[] };
        this.enMiLista = data.items.some(p => p.id === this.pelicula?.id);
      } else {
        this.enMiLista = false;
      }
    } catch (e) {
      console.error('Error verificando Mi Lista', e);
    }
  }

  // 🔹 Agregar o quitar de Mi Lista
  async toggleMiLista() {
    const usuario: User | null = this.authService.getUsuarioActual();
    if (!usuario || !this.pelicula) {
      this.router.navigate(['/login']);
      return;
    }

    const miListaDocRef = doc(this.firestore, `usuarios/${usuario.uid}/mi-lista/lista`);
    try {
      const docSnap = await getDoc(miListaDocRef);

      if (this.enMiLista) {
        await updateDoc(miListaDocRef, { items: arrayRemove(this.pelicula) });
        this.enMiLista = false;
        this.showToast('Película removida de Mi Lista');
      } else {
        if (docSnap.exists()) {
          await updateDoc(miListaDocRef, { items: arrayUnion(this.pelicula) });
        } else {
          await setDoc(miListaDocRef, { items: [this.pelicula] });
        }
        this.enMiLista = true;
        this.showToast('Película agregada a Mi Lista ✅');
      }
    } catch (e) {
      console.error('Error modificando Mi Lista', e);
      this.showToast('Error al modificar Mi Lista 😢');
    }
  }

  // 🔹 Mostrar notificación
  private async showToast(message: string) {
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
