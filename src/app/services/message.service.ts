import { Injectable } from '@angular/core';

export type MessageType = 'error' | 'success' | 'info';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  messageText = '';
  messageType: MessageType = 'info';
  showMessageFlag = false;
  private messageTimer: any = null;
  private readonly DEFAULT_DURATION = 4500;

  showMessage(text: string, type: MessageType = 'info', duration: number = this.DEFAULT_DURATION) {
    this.clearMessageTimer();
    this.messageText = text;
    this.messageType = type;
    this.showMessageFlag = true;
    this.messageTimer = setTimeout(() => this.clearMessage(), duration);
  }

  clearMessageTimer() {
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
      this.messageTimer = null;
    }
  }

  clearMessage() {
    this.showMessageFlag = false;
    this.messageText = '';
    this.messageType = 'info';
    this.clearMessageTimer();
  }
}
