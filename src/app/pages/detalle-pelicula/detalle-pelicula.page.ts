import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Movie } from 'src/app/models/movie.model';
import { AuthService } from 'src/app/services/auth';
import { Browser } from '@capacitor/browser';

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

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.peliculaId = this.route.snapshot.queryParamMap.get('id');

    if (this.peliculaId) {
      await this.cargarPelicula(this.peliculaId);
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

    await Browser.open({
      url,
      windowName: '_blank'
    });
  }

  async verPelicula() {
    if (!this.pelicula?.movieUrl) return;

    await Browser.open({
      url: this.pelicula.movieUrl,
      windowName: '_blank'
    });
  }

  agregarMiLista() {
    console.log("Pendiente: guardar en lista");
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
