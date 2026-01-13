import { ComponentFixture, TestBed } from '@angular/core/testing';

import ChangelogPageComponent from './changelog-page.component';

describe('ChangelogPageComponent', () => {
  let component: ChangelogPageComponent;
  let fixture: ComponentFixture<ChangelogPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChangelogPageComponent]
    });
    fixture = TestBed.createComponent(ChangelogPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
