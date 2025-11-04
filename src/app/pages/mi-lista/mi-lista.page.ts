import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-mi-lista',
  templateUrl: './mi-lista.page.html',
  styleUrls: ['./mi-lista.page.scss'],
  standalone: false,
})
export class MiListaPage implements OnInit {

  miLista: Movie[] = [];
  historial: Movie[] = [];
  menuAbierto = false;
  uid: string = "";

  constructor(
    private auth: AuthService,
    private firestore: Firestore,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = await this.auth.getCurrentUser();
    if (!user) return;

    this.uid = user.uid;
    await this.cargarDatos();
  }

  async cargarDatos() {
    const userRef = doc(this.firestore, `usuarios/${this.uid}`);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data: any = docSnap.data();
      this.miLista = data.miLista || [];
      this.historial = data.historial || [];
    }
  }

  irADetalle(movie: Movie) {
    this.router.navigate(['/detalle-pelicula'], { queryParams: { id: movie.id } });
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  logout() {
    this.auth.logout();
  }
}
