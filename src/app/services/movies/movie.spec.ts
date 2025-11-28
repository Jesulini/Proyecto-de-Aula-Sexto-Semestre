import { TestBed } from '@angular/core/testing';
import { provideFirestore } from '@angular/fire/firestore';
import { MoviesService } from './movies.service';
import { AuthService } from 'src/app/services/auth/auth';

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MoviesService,
        AuthService,
        provideFirestore(() => ({} as any)) 
      ]
    });
    service = TestBed.inject(MoviesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
