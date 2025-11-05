import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { Movie } from 'src/app/models/movie.model';
import { AuthService, User } from 'src/app/services/auth';
import { Browser } from '@capacitor/browser';
import { ToastController } from '@ionic/angular';

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
  featuredList: Movie[] = [];
  currentIndex = 0;
  enMiLista = false; // ✅ Variable para controlar el estado del botón

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.peliculaId = this.route.snapshot.queryParamMap.get('id');

    if (this.peliculaId) {
      await this.cargarPelicula(this.peliculaId);
      await this.checkMiLista();
    }

    await this.cargarPeliculasDestacadas();
  }

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

  async cargarPeliculasDestacadas() {
    try {
      const ref = doc(this.firestore, 'peliculas/peliculas');
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as { items: Movie[] };
        this.featuredList = data.items;
      }
    } catch (e) { console.error(e); }
  }

  toggleMenu() { this.menuAbierto = !this.menuAbierto; }
  showSlide(i: number) { this.currentIndex = i; }
  nextSlide() { this.currentIndex = (this.currentIndex + 1) % this.featuredList.length; }
  prevSlide() { this.currentIndex = (this.currentIndex - 1 + this.featuredList.length) % this.featuredList.length; }

  goToMovie(id: string) {
    this.router.navigate(['/detalle-pelicula'], { queryParams: { id }});
  }

  async verTrailer(url?: string) {
    if (!url) return;

    await Browser.open({ url, windowName: '_blank' });
  }

  async verPelicula() {
    if (!this.pelicula?.movieUrl) return;

    await Browser.open({ url: this.pelicula.movieUrl, windowName: '_blank' });
  }

  // ✅ Verifica si la película ya está en la lista del usuario
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

  // ✅ Agregar o quitar de Mi Lista
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
        // Quitar de la lista
        await updateDoc(miListaDocRef, { items: arrayRemove(this.pelicula) });
        this.enMiLista = false;
        this.showToast('Película removida de Mi Lista');
      } else {
        // Agregar a la lista
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

  private async showToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000, position: 'bottom' });
    toast.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
