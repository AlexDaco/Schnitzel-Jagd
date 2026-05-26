import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Posten1Page } from './posten1.page';

describe('Posten1Page', () => {
  let component: Posten1Page;
  let fixture: ComponentFixture<Posten1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Posten1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
