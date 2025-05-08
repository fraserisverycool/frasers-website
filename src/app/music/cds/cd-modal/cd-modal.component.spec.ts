import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdModalComponent } from './cd-modal.component';

describe('CdModalComponent', () => {
  let component: CdModalComponent;
  let fixture: ComponentFixture<CdModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CdModalComponent]
    });
    fixture = TestBed.createComponent(CdModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
