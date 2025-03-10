import { ComponentFixture, TestBed } from '@angular/core/testing';
import NextComponent from "./next.component";


describe('NextComponent', () => {
  let component: NextComponent;
  let fixture: ComponentFixture<NextComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NextComponent]
    });
    fixture = TestBed.createComponent(NextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
