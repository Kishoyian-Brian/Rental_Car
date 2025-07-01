import { TestBed } from '@angular/core/testing';

import { Booknow } from './booknow';

describe('Booknow', () => {
  let service: Booknow;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Booknow);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
