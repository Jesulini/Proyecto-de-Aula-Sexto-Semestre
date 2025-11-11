import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface User {
  uid: string;
  email: string;
  nombre: string;
  foto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioActualSubject = new BehaviorSubject<User | null>(null);
  private auth: Auth;
  private firestore: Firestore;

  constructor(auth: Auth, firestore: Firestore) {
    this.auth = auth;
    this.firestore = firestore;

    onAuthStateChanged(this.auth, async (user: FirebaseUser | null) => {
      if (user) {
        const docRef = doc(this.firestore, `usuarios/${user.uid}`);
        const docSnap = await getDoc(docRef);
        const data = docSnap.exists() ? docSnap.data() : {};
        const usuario: User = {
          uid: user.uid,
          email: user.email!,
          nombre: (data as any)?.nombre || '',
          foto: (data as any)?.foto || ''
        };
        this.usuarioActualSubject.next(usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
      } else {
        this.usuarioActualSubject.next(null);
        localStorage.removeItem('usuario');
      }
    });
  }

  usuarioActual$() {
    return this.usuarioActualSubject.asObservable();
  }

  getUsuarioActual(): User | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  getUser(): User | null {
    return this.getUsuarioActual();
  }

  async registro(email: string, password: string, nombre: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(cred.user, { displayName: nombre });
    const usuario: User = {
      uid: cred.user.uid,
      email: cred.user.email!,
      nombre,
      foto: ''
    };
    const docRef = doc(this.firestore, `usuarios/${cred.user.uid}`);
    await setDoc(docRef, { nombre, email, foto: '' });
    localStorage.setItem('usuario', JSON.stringify(usuario));
    return cred;
  }

  register(nombre: string, email: string, password: string) {
    return this.registro(email, password, nombre);
  }

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    const usuario: User = {
      uid: cred.user.uid,
      email: cred.user.email!,
      nombre: cred.user.displayName || '',
      foto: ''
    };
    this.usuarioActualSubject.next(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    return cred;
  }

  logout() {
    this.usuarioActualSubject.next(null);
    localStorage.removeItem('usuario');
    return signOut(this.auth);
  }

  async resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  async reauthenticate(email: string): Promise<boolean> {
    const password = prompt('Por seguridad, ingresa tu contraseña actual para continuar:');
    if (!password || !email) return false;

    const credential = EmailAuthProvider.credential(email, password);
    try {
      const user = this.auth.currentUser;
      if (!user) return false;
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch {
      return false;
    }
  }
}
