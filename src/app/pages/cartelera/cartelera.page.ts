import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from 'src/app/models/movie.model';

@Component({
  selector: 'app-cartelera',
  templateUrl: './cartelera.page.html',
  styleUrls: ['./cartelera.page.scss'],
  standalone: false,
})
export class CarteleraPage implements OnInit {
  peliculas: Movie[] = [
    { id: '1', title: 'Inception', imageUrl: 'assets/inception.jpg', category: 'Ciencia Ficción' },
    { id: '2', title: 'Titanic', imageUrl: 'assets/titanic.jpg', category: 'Romance' },
    { id: '3', title: 'John Wick', imageUrl: 'assets/johnwick.jpg', category: 'Acción' },
    { id: '4', title: 'Toy Story', imageUrl: 'assets/toystory.jpg', category: 'Animación' },
    { id: '5', title: 'El Conjuro', imageUrl: 'assets/conjuro.jpg', category: 'Terror' },
  ];

  categorias: string[] = ['Todos', 'Acción', 'Romance', 'Ciencia Ficción', 'Animación', 'Terror'];
  categoriaSeleccionada = 'Todos';
  terminoBusqueda = '';
  peliculasFiltradas: Movie[] = [];
  menuAbierto = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.peliculasFiltradas = this.peliculas;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  buscarPeliculas() {
    const termino = this.terminoBusqueda.toLowerCase();
    this.peliculasFiltradas = this.peliculas.filter(movie =>
      movie.title.toLowerCase().includes(termino) &&
      (this.categoriaSeleccionada === 'Todos' || movie.category === this.categoriaSeleccionada)
    );
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.buscarPeliculas();
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
