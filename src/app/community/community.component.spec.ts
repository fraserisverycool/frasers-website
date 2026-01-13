import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import CommunityComponent from './community.component';

describe('CommunityComponent', () => {
  let component: CommunityComponent;
  let fixture: ComponentFixture<CommunityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommunityComponent],
      providers: [provideRouter([])]
    });
    fixture = TestBed.createComponent(CommunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
