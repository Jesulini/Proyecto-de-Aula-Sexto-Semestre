import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, updateProfile, updateEmail, updatePassword, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private firestore = inject(Firestore);

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  user: User | null = null;
  displayName = '';
  email = '';
  photoURL = '';
  isEditing = false;
  newPhotoURL = '';
  newPassword = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  isLoading = false;
  dragOver = false;

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.user = this.auth.currentUser;
    if (this.user) {
      this.displayName = this.user.displayName || '';
      this.email = this.user.email || '';
      this.photoURL = this.user.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg';
    }
  }

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    const file = input.files[0];
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert('El archivo debe ser menor a 10MB');
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };
      const compressed = await imageCompression(file, options);
      this.selectedFile = compressed;

      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(compressed);
    } catch (error) {
      alert('Error al comprimir la imagen');
      console.error(error);
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }

  revertImage() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files?.length) {
      const fileList = event.dataTransfer.files;
      const fakeEvent = { target: { files: fileList } } as unknown as Event;
      this.onFileChange(fakeEvent);
    }
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  private getBase() {
    return environment.supabaseUrl.replace(/\/$/, '');
  }

  private extractPathFromUrl(url: string): string | null {
    const base = this.getBase();
    const prefix = `${base}/storage/v1/object/public/`;
    if (!url.startsWith(prefix)) return null;
    return url.slice(prefix.length);
  }

  private async deletePreviousImage() {
    const path = this.extractPathFromUrl(this.photoURL);
    if (!path) return;
    const base = this.getBase();
    const url = `${base}/storage/v1/object/${path}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${environment.supabaseAnonKey}`,
        apikey: environment.supabaseAnonKey
      }
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn('No se pudo eliminar la imagen anterior:', res.status, text);
    }
  }

  private async uploadDirectPut(): Promise<string> {
    if (!this.user || !this.selectedFile) throw new Error('No user or file');
    const base = this.getBase();
    const bucket = 'avatars';
    const timestamp = Date.now();
    const safe = this.selectedFile.name.replace(/\s+/g, '-');
    const pathInBucket = `${this.user.uid}/${timestamp}-${safe}`;
    const url = `${base}/storage/v1/object/${bucket}/${encodeURIComponent(pathInBucket)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${environment.supabaseAnonKey}`,
        apikey: environment.supabaseAnonKey,
        'x-upsert': 'true'
      },
      body: this.selectedFile
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PUT failed ${res.status}: ${text}`);
    }
    return `${base}/storage/v1/object/public/${bucket}/${pathInBucket}`;
  }

  private async updateFirestoreProfile(uid: string, nombre: string, email: string, foto: string) {
    const ref = doc(this.firestore, `usuarios/${uid}`);
    await setDoc(ref, { nombre, email, foto }, { merge: true });
    const usuario = { uid, nombre, email, foto };
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  async saveChanges() {
    if (!this.user) return;

    const hasNameChange = this.displayName !== this.user.displayName;
    const hasEmailChange = this.email !== this.user.email;
    const hasPasswordChange = this.newPassword.trim() !== '';
    const hasImageChange = !!this.selectedFile;

    if (!hasNameChange && !hasEmailChange && !hasPasswordChange && !hasImageChange) {
      alert('No hay cambios para guardar');
      return;
    }

    this.isLoading = true;
    let finalPhoto = this.photoURL;

    if (hasImageChange) {
      try {
        const newUrl = await this.uploadDirectPut();
        await this.deletePreviousImage();
        finalPhoto = newUrl;
      } catch (err: any) {
        alert('Error subiendo imagen: ' + (err?.message || String(err)));
        console.error(err);
        this.isLoading = false;
        return;
      }
    }

    try {
      await updateProfile(this.user, {
        displayName: this.displayName,
        photoURL: finalPhoto
      });

      if (hasEmailChange) {
        await updateEmail(this.user, this.email);
      }

      if (hasPasswordChange) {
        await updatePassword(this.user, this.newPassword);
        this.newPassword = '';
      }

      await this.updateFirestoreProfile(this.user.uid, this.displayName, this.email, finalPhoto);

      this.photoURL = finalPhoto;
      this.selectedFile = null;
      this.previewUrl = null;
      this.isEditing = false;
      this.loadUserData();
    } catch (err: any) {
      alert('Error al actualizar el perfil: ' + (err?.message || String(err)));
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['/login']);
  }

  editProfile() {
    this.isEditing = true;
    this.newPhotoURL = this.photoURL;
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedFile = null;
    this.previewUrl = null;
  }
}
