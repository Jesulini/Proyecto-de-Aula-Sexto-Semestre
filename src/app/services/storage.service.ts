import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private messageService: MessageService) {}

  getBase(): string {
    return environment.supabaseUrl.replace(/\/$/, '');
  }

  extractPathFromUrl(url: string): string | null {
    if (!url) return null;
    const base = this.getBase();
    const prefix = `${base}/storage/v1/object/public/`;
    if (!url.startsWith(prefix)) return null;

    const cleanUrl = decodeURIComponent(url.split('?')[0]); // Elimina parámetros y decodifica
    return cleanUrl.slice(prefix.length);
  }

  validateImage(file: File): string | null {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) return 'El archivo debe ser menor a 10MB';
    if (!file.type.startsWith('image/')) return 'Solo se permiten archivos de imagen';
    return null;
  }

  async deletePreviousImage(photoURL: string): Promise<void> {
    if (!photoURL.includes(this.getBase())) return;

    const path = this.extractPathFromUrl(photoURL);
    if (!path) {
      this.messageService.showMessage('No se pudo extraer la ruta de la imagen anterior', 'info');
      return;
    }

    const parts = path.split('/');
    const bucket = parts.shift();
    const filePath = parts.join('/');
    if (!bucket || !filePath) {
      this.messageService.showMessage('Ruta inválida para eliminar imagen anterior', 'info');
      return;
    }

    const base = this.getBase();
    const decodedPath = decodeURIComponent(filePath); // Evita doble codificación
    const url = `${base}/storage/v1/object/${bucket}/${decodedPath}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${environment.supabaseAnonKey}`,
        apikey: environment.supabaseAnonKey
      }
    });

    if (!res.ok) {
      const text = await res.text();
      this.messageService.showMessage(`Error al eliminar imagen anterior (${res.status}): ${text}`, 'error');
    } else {
      this.messageService.showMessage('Imagen anterior eliminada correctamente', 'success');
    }
  }

  async uploadDirectPut(uid: string, file: File): Promise<string> {
    const base = this.getBase();
    const bucket = 'avatars';
    const timestamp = Date.now();
    const safe = file.name.replace(/\s+/g, '-');
    const pathInBucket = `${uid}/${timestamp}-${safe}`;
    const putUrl = `${base}/storage/v1/object/${bucket}/${encodeURIComponent(pathInBucket)}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${environment.supabaseAnonKey}`,
      apikey: environment.supabaseAnonKey,
      'x-upsert': 'true'
    };
    if (file.type) {
      headers['Content-Type'] = file.type;
    }

    const res = await fetch(putUrl, {
      method: 'PUT',
      headers,
      body: file
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PUT failed ${res.status}: ${text}`);
    }

    return `${base}/storage/v1/object/public/${bucket}/${encodeURIComponent(pathInBucket)}`;
  }
}
