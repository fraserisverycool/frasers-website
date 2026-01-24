import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactGameComponent } from './contact-game.component';

describe('ContactGameComponent', () => {
  let component: ContactGameComponent;
  let fixture: ComponentFixture<ContactGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
