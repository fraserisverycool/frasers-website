import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldpeaceComponent } from './worldpeace.component';

describe('WorldpeaceComponent', () => {
  let component: WorldpeaceComponent;
  let fixture: ComponentFixture<WorldpeaceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WorldpeaceComponent]
    });
    fixture = TestBed.createComponent(WorldpeaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
