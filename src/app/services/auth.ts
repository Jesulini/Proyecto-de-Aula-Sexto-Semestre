import { Injectable } from '@angular/core';
import {Auth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,updateProfile,sendPasswordResetEmail} from '@angular/fire/auth';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  constructor() {}

  async register(nombre: string, email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(userCredential.user, { displayName: nombre });
    localStorage.setItem('user', JSON.stringify(userCredential.user));
    return userCredential;
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    localStorage.setItem('user', JSON.stringify(userCredential.user));
    return userCredential;
  }

  logout() {
    localStorage.removeItem('user');
    return signOut(this.auth);
  }

  getUser() {
    return this.auth.currentUser;
  }

  async getCurrentUser(): Promise<any> {
    return this.auth.currentUser;
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  async getCurrentUserEmail(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? user.email : null;
  }
}
