import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail} from '@angular/fire/auth';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  constructor() {}

  // 🧾 Registro con nombre
  async register(nombre: string, email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(userCredential.user, { displayName: nombre });
    return userCredential;
  }

  // 🔐 Login
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // 🚪 Cerrar sesión
  logout() {
    return signOut(this.auth);
  }

  // 👤 Usuario actual
  getUser() {
    return this.auth.currentUser;
  }

  // 🔁 Restablecer contraseña
  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }
}
