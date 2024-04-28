import { TestBed } from '@angular/core/testing';

import { CheckPermissionGuard } from './check-permission.guard';

describe('CheckPermissionGuard', () => {
  let guard: CheckPermissionGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CheckPermissionGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
