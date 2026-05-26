import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Posten2Page } from './posten2.page';

describe('Posten2Page', () => {
  let component: Posten2Page;
  let fixture: ComponentFixture<Posten2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Posten2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
