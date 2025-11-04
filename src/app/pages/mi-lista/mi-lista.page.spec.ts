import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiListaPage } from './mi-lista.page';

describe('MiListaPage', () => {
  let component: MiListaPage;
  let fixture: ComponentFixture<MiListaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MiListaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
