import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarteleraPage } from './cartelera.page';

describe('CarteleraPage', () => {
  let component: CarteleraPage;
  let fixture: ComponentFixture<CarteleraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarteleraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
