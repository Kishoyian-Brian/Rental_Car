import { TestBed } from '@angular/core/testing';

import { Allcars } from './allcars';

describe('Allcars', () => {
  let service: Allcars;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Allcars);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
