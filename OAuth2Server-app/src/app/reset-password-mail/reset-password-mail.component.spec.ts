import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordMailComponent } from './reset-password-mail.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordMailComponent;
  let fixture: ComponentFixture<ResetPasswordMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswordMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
