import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail} from '@angular/fire/auth';
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
    return userCredential;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  getUser() {
    return this.auth.currentUser;
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }
}
