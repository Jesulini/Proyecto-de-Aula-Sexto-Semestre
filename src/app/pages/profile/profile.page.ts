import { Component, OnInit } from '@angular/core';
import { Auth, updateProfile, updateEmail, updatePassword, User } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);

  user: User | null = null;
  displayName: string = '';
  email: string = '';
  photoURL: string = '';
  isEditing: boolean = false;
  newPhotoURL: string = '';
  newPassword: string = ''; 
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

  async saveChanges() {
    if (!this.user) return;

    try {
      await updateProfile(this.user, {
        displayName: this.displayName,
        photoURL: this.newPhotoURL || this.photoURL
      });

      if (this.email !== this.user.email) {
        await updateEmail(this.user, this.email);
      }

      if (this.newPassword.trim() !== '') {
        await updatePassword(this.user, this.newPassword);
        this.newPassword = '';
        alert(' Contraseña actualizada correctamente');
      }

      this.isEditing = false;
      this.loadUserData();
      alert(' Perfil actualizado con éxito');
    } catch (error: any) {
      console.error(error);
      alert(' Error al actualizar el perfil: ' + error.message);
    }
  }

  editProfile() {
    this.isEditing = true;
    this.newPhotoURL = this.photoURL;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
