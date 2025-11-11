import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, updateProfile, updateEmail, updatePassword, User } from '@angular/fire/auth';
import { StorageService } from '../../services/storage.service';
import { MessageService } from '../../services/message.service';
import { ProfileService } from '../../services/profile.service';
import { mapFirebaseError } from '../../utils/error-utils';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private messageService = inject(MessageService);
  private profileService = inject(ProfileService);

  user: User | null = null;
  displayName = '';
  email = '';
  photoURL = '';
  isEditing = false;
  newPhotoURL = '';
  newPassword = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  canSaveChanges = false;

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
    this.updateCanSaveChanges();
  }

  updateCanSaveChanges() {
    if (!this.user) {
      this.canSaveChanges = false;
      return;
    }

    const hasNameChange = this.displayName !== this.user.displayName;
    const hasEmailChange = this.email !== this.user.email;
    const hasPasswordChange = this.newPassword.trim() !== '';
    const hasImageChange = !!this.selectedFile;

    this.canSaveChanges = hasNameChange || hasEmailChange || hasPasswordChange || hasImageChange;
  }

  async saveChanges() {
    if (!this.user) {
      this.messageService.showMessage('No estás autenticado. Inicia sesión para guardar cambios.', 'error');
      return;
    }

    if (!this.canSaveChanges) {
      this.messageService.showMessage('No hay cambios para guardar', 'info');
      return;
    }

    let finalPhoto = this.photoURL;

    if (this.selectedFile) {
      const previousPhoto = this.photoURL;

      try {
        const newUrl = await this.storageService.uploadDirectPut(this.user.uid, this.selectedFile);
        await this.storageService.deletePreviousImage(previousPhoto);
        finalPhoto = newUrl;
        this.messageService.showMessage('Imagen subida correctamente', 'success');
      } catch (err: any) {
        this.messageService.showMessage(mapFirebaseError(err), 'error');
        return;
      }
    }

    try {
      await updateProfile(this.user, {
        displayName: this.displayName,
        photoURL: finalPhoto
      });

      if (this.email !== this.user.email) {
        await updateEmail(this.user, this.email);
      }

      if (this.newPassword.trim() !== '') {
        await updatePassword(this.user, this.newPassword);
        this.newPassword = '';
      }

      await this.profileService.updateFirestoreProfile(this.user.uid, this.displayName, this.email, finalPhoto);

      this.photoURL = finalPhoto;
      this.selectedFile = null;
      this.previewUrl = null;
      this.isEditing = false;
      this.loadUserData();
      this.messageService.showMessage('Perfil actualizado correctamente', 'success');
    } catch (err: any) {
      this.messageService.showMessage(mapFirebaseError(err), 'error');
    }
  }

  editProfile() {
    this.isEditing = true;
    this.newPhotoURL = this.photoURL;
    this.updateCanSaveChanges();
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedFile = null;
    this.previewUrl = null;
    this.newPassword = '';
    this.loadUserData();
  }

  revertImage() {
    this.previewUrl = null;
    this.selectedFile = null;
    this.newPhotoURL = this.photoURL;
    this.messageService.showMessage('Imagen revertida a la original', 'info');
    this.updateCanSaveChanges();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['/login']);
  }

  goToSubscription() {
    this.router.navigate(['/subscription']);
  }

  goToPayments() {
    this.router.navigate(['/payments']);
  }

  confirmDeleteAccount() {
    this.router.navigate(['/delete-account']);
  }

  handleUploadError(msg: string) {
    this.messageService.showMessage(msg, 'error');
  }

  handleUploadSuccess(msg: string) {
    this.messageService.showMessage(msg, 'success');
    this.updateCanSaveChanges();
  }

  set selectedFileSetter(file: File | null) {
    this.selectedFile = file;
    this.updateCanSaveChanges();
  }

  set displayNameSetter(name: string) {
    this.displayName = name;
    this.updateCanSaveChanges();
  }

  set emailSetter(email: string) {
    this.email = email;
    this.updateCanSaveChanges();
  }

  set newPasswordSetter(pass: string) {
    this.newPassword = pass;
    this.updateCanSaveChanges();
  }
}
