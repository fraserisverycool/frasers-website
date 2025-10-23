import { ComponentFixture, TestBed } from '@angular/core/testing';
import NextGameComponent from "./next-game.component";


describe('NextComponent', () => {
  let component: NextGameComponent;
  let fixture: ComponentFixture<NextGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NextGameComponent]
    });
    fixture = TestBed.createComponent(NextGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
