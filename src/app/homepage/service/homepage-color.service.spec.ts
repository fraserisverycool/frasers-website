import { TestBed } from '@angular/core/testing';

import { HomepageColorService } from './homepage-color.service';

describe('HomepageColorService', () => {
  let service: HomepageColorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomepageColorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
