import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Movie } from 'src/app/models/movie.model';
import { AuthService } from 'src/app/services/auth/auth';
import { Firestore, doc, getDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  featuredList: Movie[] = [];
  currentIndex = 0;
  slideInterval: any;
  @ViewChild('carruselContainer') carruselContainer!: ElementRef;
  carruselIndex = 0;

  isAdmin = false;

  modalAbierto = false;
  editando = false;
  peliculaTemp: Movie = {
    id: '',
    title: '',
    imageUrl: '',
    category: '',
    description: '',
    trailerUrl: '',
    movieUrl: ''
  };

  modalReproducirAbierto = false;
  peliculaReproducir: Movie | null = null;

  categorias: string[] = ['Acción', 'Romance', 'Ciencia Ficción', 'Animación', 'Terror'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private firestore: Firestore,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
    const user = this.authService.getUser();
    const email = user?.email?.trim().toLowerCase() || '';
    this.isAdmin = email === 'jesulini14@gmail.com';
    this.loadMovies();
  }

  ngAfterViewInit(): void {
    this.updateCarrusel();
    window.addEventListener('resize', () => this.updateCarrusel());
  }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  async loadMovies(): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { items: Movie[] };
        this.featuredList = data.items || [];
        this.updateCarrusel();
      }
    } catch (error) {
      console.error('Error cargando películas:', error);
    }
  }

  showSlide(index: number): void {
    this.currentIndex = index;
    this.resetInterval();
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.featuredList.length;
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.featuredList.length) % this.featuredList.length;
  }

  resetInterval(): void {
    clearInterval(this.slideInterval);
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  goToMovie(id: string): void {
    this.router.navigate(['/detalle-pelicula'], { queryParams: { id } });
  }

  nextCarrusel(): void {
    this.carruselIndex = (this.carruselIndex + 1) % this.featuredList.length;
    this.updateCarrusel();
  }

  prevCarrusel(): void {
    this.carruselIndex = (this.carruselIndex - 1 + this.featuredList.length) % this.featuredList.length;
    this.updateCarrusel();
  }

  updateCarrusel(): void {
    const container = this.carruselContainer?.nativeElement;
    if (!container) return;
    const item = container.querySelector('.movie');
    if (!item) return;
    const style = getComputedStyle(item);
    const itemWidth = item.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
    container.style.transform = `translateX(-${this.carruselIndex * itemWidth}px)`;
    container.style.transition = 'transform 0.5s ease';
  }

  abrirModalAgregar(): void {
    this.editando = false;
    this.peliculaTemp = {
      id: '',
      title: '',
      imageUrl: '',
      category: '',
      description: '',
      trailerUrl: '',
      movieUrl: ''
    };
    this.modalAbierto = true;
  }

  abrirModalEditar(movie: Movie): void {
    this.editando = true;
    this.peliculaTemp = { ...movie };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  async guardarPelicula(): Promise<void> {
    const { title, imageUrl, category, description, trailerUrl, movieUrl, id } = this.peliculaTemp;

    if (!title?.trim() || !imageUrl?.trim() || !category?.trim()) {
      this.presentToast('Todos los campos obligatorios deben estar llenos.');
      return;
    }

    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');

      if (this.editando && id) {
        this.featuredList = this.featuredList.map(p =>
          p.id === id ? { ...p, title, imageUrl, category, description, trailerUrl, movieUrl } : p
        );
        await updateDoc(docRef, { items: this.featuredList });
        this.presentToast('Película actualizada.');
      } else {
        const nuevaPeli: Movie = {
          id: this.generarId(),
          title,
          imageUrl,
          category,
          description,
          trailerUrl,
          movieUrl
        };
        this.featuredList.push(nuevaPeli);
        await updateDoc(docRef, { items: arrayUnion(nuevaPeli) });
        this.presentToast('Película agregada.');
      }
      this.cerrarModal();
      this.updateCarrusel();
    } catch (error) {
      console.error('Error guardando película:', error);
      this.presentToast('Error al guardar la película.');
    }
  }

  async deleteMovie(movie: Movie): Promise<void> {
    this.featuredList = this.featuredList.filter(p => p.id !== movie.id);
    try {
      const docRef = doc(this.firestore, 'peliculas/peliculas');
      await updateDoc(docRef, { items: this.featuredList });
      this.presentToast('Película eliminada.');
      this.updateCarrusel();
    } catch (error) {
      console.error('Error eliminando película:', error);
      this.presentToast('Error al eliminar.');
    }
  }

  async presentToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  generarId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  abrirModalReproducir(movie: Movie): void {
    this.peliculaReproducir = movie;
    this.modalReproducirAbierto = true;
  }

  cerrarModalReproducir(): void {
    this.modalReproducirAbierto = false;
    this.peliculaReproducir = null;
  }

  esYoutubeUrl(url?: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getSafeUrl(url?: string): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.convertirUrlYoutube(url));
  }

  private convertirUrlYoutube(url: string): string {
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return url;
  }
}
