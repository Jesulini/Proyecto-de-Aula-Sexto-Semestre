import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Movie } from 'src/app/models/movie.model';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-detalle-pelicula',
  templateUrl: './detalle-pelicula.page.html',
  styleUrls: ['./detalle-pelicula.page.scss'],
  standalone: false,
})
export class DetallePeliculaPage implements OnInit {

  pelicula: Movie | null = null;
  peliculaId: string | null = null;

  // ===== HEADER / SIDEBAR =====
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
    // Obtenemos el id de los queryParams
    this.peliculaId = this.route.snapshot.queryParamMap.get('id');
    if (this.peliculaId) {
      await this.cargarPelicula(this.peliculaId);
    }

    // Cargar lista destacadas para el slider (header)
    await this.cargarPeliculasDestacadas();
  }

  /** 🔹 Cargar película específica */
  async cargarPelicula(id: string) {
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { items: Movie[] };
        this.pelicula = data.items.find(p => p.id === id) || null;
      }
    } catch (error) {
      console.error('Error cargando película:', error);
    }
  }

  /** 🔹 Cargar películas para el slider */
  async cargarPeliculasDestacadas() {
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { items: Movie[] };
        this.featuredList = data.items || [];
      }
    } catch (error) {
      console.error('Error cargando películas destacadas:', error);
    }
  }

  // ===== HEADER / SIDEBAR FUNCIONES =====
  toggleMenu() { this.menuAbierto = !this.menuAbierto; }

  showSlide(index: number) { this.currentIndex = index; }
  nextSlide() { this.currentIndex = (this.currentIndex + 1) % this.featuredList.length; }
  prevSlide() { this.currentIndex = (this.currentIndex - 1 + this.featuredList.length) % this.featuredList.length; }

  goToMovie(id: string) {
    this.router.navigate(['/detalle-pelicula'], { queryParams: { id } });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
