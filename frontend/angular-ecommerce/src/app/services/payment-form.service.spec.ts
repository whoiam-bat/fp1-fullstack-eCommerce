import { TestBed } from '@angular/core/testing';

import { PaymentFromService } from './payment-form.service';

describe('PaymentFromService', () => {
  let service: PaymentFromService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentFromService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
