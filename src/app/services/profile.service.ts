import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private firestore: Firestore) {}

  async updateFirestoreProfile(uid: string, nombre: string, email: string, foto: string): Promise<void> {
    const ref = doc(this.firestore, `usuarios/${uid}`);
    await setDoc(ref, { nombre, email, foto }, { merge: true });
    const usuario = { uid, nombre, email, foto };
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
}
