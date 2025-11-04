import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/usuario';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarioActualSubject = new BehaviorSubject<User | null>(null);

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.firestore.collection('usuarios').doc(user.uid).valueChanges().subscribe((data: any) => {
          const usuario: User = {
            uid: user.uid,
            email: user.email!,
            nombre: data?.nombre || '',
            foto: data?.foto || ''
          };
          this.usuarioActualSubject.next(usuario);
          localStorage.setItem('usuario', JSON.stringify(usuario));
        });
      } else {
        this.usuarioActualSubject.next(null);
        localStorage.removeItem('usuario');
      }
    });
  }

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  registro(email: string, password: string, nombre: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password)
      .then(cred => {
        return this.firestore.collection('usuarios').doc(cred.user?.uid).set({
          nombre,
          email,
          foto: ''
        });
      });
  }

  logout() {
    localStorage.removeItem('usuario');
    return this.afAuth.signOut();
  }

  // ✅ Retorna el observable del usuario actual
  usuarioActual$() {
    return this.usuarioActualSubject.asObservable();
  }

  // ✅ Retorna el usuario actual sincronamente (usado en tu error)
  getUsuarioActual() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }
}
