import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangelogPageComponent } from './changelog-page.component';

describe('ChangelogComponent', () => {
  let component: ChangelogComponent;
  let fixture: ComponentFixture<ChangelogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChangelogComponent]
    });
    fixture = TestBed.createComponent(ChangelogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
