import { Injectable } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  serverTimestamp, 
  collection, 
  getDocs 
} from '@angular/fire/firestore';
import { environment } from '../../environments/environment';

const subscriptionsApp = initializeApp(environment.firebaseSubscriptionsConfig, "subscriptionsApp");
const subscriptionsDb = getFirestore(subscriptionsApp);

export interface Subscription {
  email: string;
  subscriptionType: string;
  subscriptionDate: any; // serverTimestamp
  status: string;
  priceCOP: number;
}

export interface MovieRequest {
  email: string;
  requestType: string;
  requestDate: any; // serverTimestamp
  status: string;
  priceCOP: number;
  movieName: string;
  movieDescription: string;
  movieLanguage: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  async saveSubscription(uid: string, subscription: Subscription) {
    const userRef = doc(subscriptionsDb, `users_subscriptions/${uid}`);
    await setDoc(userRef, {
      ...subscription,
      subscriptionDate: serverTimestamp()
    }, { merge: true });
  }

  async getSubscription(uid: string): Promise<Subscription | null> {
    const userRef = doc(subscriptionsDb, `users_subscriptions/${uid}`);
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as Subscription) : null;
  }

  async deleteSubscription(uid: string) {
    const userRef = doc(subscriptionsDb, `users_subscriptions/${uid}`);
    await deleteDoc(userRef);
  }

  async saveMovieRequest(uid: string, request: MovieRequest) {
    const requestRef = doc(subscriptionsDb, `users_requests/${uid}/solicitudes/${Date.now()}`);
    await setDoc(requestRef, {
      ...request,
      requestDate: serverTimestamp()
    });
  }

  async getMovieRequests(uid: string): Promise<MovieRequest[]> {
    const requestsCol = collection(subscriptionsDb, `users_requests/${uid}/solicitudes`);
    const snap = await getDocs(requestsCol);
    return snap.docs.map(doc => doc.data() as MovieRequest);
  }
}
