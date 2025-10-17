import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePeliculaPage } from './detalle-pelicula.page';

describe('DetallePeliculaPage', () => {
  let component: DetallePeliculaPage;
  let fixture: ComponentFixture<DetallePeliculaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallePeliculaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
