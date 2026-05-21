import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Posten5Page } from './posten5.page';

describe('Posten5Page', () => {
  let component: Posten5Page;
  let fixture: ComponentFixture<Posten5Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Posten5Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
