import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Posten3Page } from './posten3.page';

describe('Posten3Page', () => {
  let component: Posten3Page;
  let fixture: ComponentFixture<Posten3Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Posten3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
