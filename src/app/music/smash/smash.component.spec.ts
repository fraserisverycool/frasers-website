import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import SmashComponent from './smash.component';

describe('SmashComponent', () => {
  let component: SmashComponent;
  let fixture: ComponentFixture<SmashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmashComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
