import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs, doc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth';
import { Movie } from 'src/app/models/movie.model';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-mi-lista',
  templateUrl: './mi-lista.page.html',
  styleUrls: ['./mi-lista.page.scss'],
  standalone: false,
})
export class MiListaPage implements OnInit {

  lista: Movie[] = [];
  historial: Movie[] = [];
  cargando = true;
  menuAbierto = false;

  constructor(
    private firestore: Firestore,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  toggleMenu() { this.menuAbierto = !this.menuAbierto; }

  async cargarDatos() {
    const usuario = this.auth.getUsuarioActual();
    if (!usuario) return;

    await this.obtenerMiLista(usuario.uid);
    await this.obtenerHistorial(usuario.uid);

    this.cargando = false;
  }

  async obtenerMiLista(uid: string) {
    const colRef = collection(this.firestore, 'mi-lista');
    const q = query(colRef, where("userId", "==", uid));
    const snap = await getDocs(q);
    this.lista = snap.docs.map(d => ({ id: d.id, ...d.data() } as Movie));
  }

  async obtenerHistorial(uid: string) {
    const colRef = collection(this.firestore, 'historial');
    const q = query(colRef, where("userId", "==", uid));
    const snap = await getDocs(q);
    this.historial = snap.docs.map(d => ({ id: d.id, ...d.data() } as Movie));
  }

  async verPelicula(url: string, peli: Movie) {
    if (!url) return;

    // Abre la película en el navegador
    await Browser.open({ url });

    // Guarda en historial
    const usuario = this.auth.getUsuarioActual();
    if (!usuario) return;

    await setDoc(doc(this.firestore, `historial/${peli.id}_${usuario.uid}`), {
      ...peli,
      userId: usuario.uid,
      vistoEn: new Date()
    });

    // Actualiza la lista de historial local
    await this.obtenerHistorial(usuario.uid);
  }

  irDetalle(id: string) {
    this.router.navigate(['/detalle-pelicula'], { queryParams: { id }});
  }

  async eliminar(item: Movie) {
    const ref = doc(this.firestore, `mi-lista/${item.id}`);
    await deleteDoc(ref);
    this.lista = this.lista.filter(m => m.id !== item.id);
  }
}
