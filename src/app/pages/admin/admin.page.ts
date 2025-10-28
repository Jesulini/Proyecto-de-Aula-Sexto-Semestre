import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from 'src/app/models/movie.model';
import { MovieService } from 'src/app/services/movie';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage implements OnInit {
  featuredList: Movie[] = [];
  movieForm: Movie = { id: '', title: '', imageUrl: '' };
  editMode = false;
  editIndex: number | null = null;

  constructor(
    private movieService: MovieService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.featuredList = this.movieService.getMovies();
  }

  saveMovie() {
    if (this.editMode && this.editIndex !== null) {
      // Editar película existente
      this.featuredList[this.editIndex] = { ...this.movieForm };
      this.movieService.updateMovies(this.featuredList);
    } else {
      // Agregar nueva película
      const newMovie = { ...this.movieForm, id: Date.now().toString() };
      this.featuredList.push(newMovie);
      this.movieService.updateMovies(this.featuredList);
    }

    this.resetForm();
  }

  editMovie(index: number) {
    this.movieForm = { ...this.featuredList[index] };
    this.editMode = true;
    this.editIndex = index;
  }

  deleteMovie(index: number) {
    this.featuredList.splice(index, 1);
    this.movieService.updateMovies(this.featuredList);
  }

  resetForm() {
    this.movieForm = { id: '', title: '', imageUrl: '' };
    this.editMode = false;
    this.editIndex = null;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
