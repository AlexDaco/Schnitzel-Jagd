import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostenPage } from './posten.page';

describe('PostenPage', () => {
  let component: PostenPage;
  let fixture: ComponentFixture<PostenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PostenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
