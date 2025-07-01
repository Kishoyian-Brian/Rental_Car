import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCars } from './all-cars';

describe('AllCars', () => {
  let component: AllCars;
  let fixture: ComponentFixture<AllCars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCars]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCars);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
