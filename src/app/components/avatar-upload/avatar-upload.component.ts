import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-avatar-upload',
  templateUrl: './avatar-upload.component.html',
  styleUrls: ['./avatar-upload.component.scss'],
  standalone: false
})
export class AvatarUploadComponent {
  @Input() photoURL = '';
  @Input() newPhotoURL = '';
  @Input() previewUrl: string | null = null;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() previewGenerated = new EventEmitter<string>();
  @Output() revert = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();
  @Output() success = new EventEmitter<string>();

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  dragOver = false;

  triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }

  revertImage() {
    this.previewUrl = null;
    this.revert.emit();
    this.success.emit('Previsualización revertida');
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

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input?.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      this.error.emit('El archivo debe ser menor a 10 MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error.emit('Solo se permiten archivos de imagen');
      return;
    }

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };
      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type || file.type });
      this.fileSelected.emit(compressedFile);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.previewGenerated.emit(this.previewUrl);
        this.success.emit('Imagen lista para subir');
      };
      reader.readAsDataURL(compressedFile);
    } catch {
      this.error.emit('Error al comprimir la imagen');
    }
  }
}
