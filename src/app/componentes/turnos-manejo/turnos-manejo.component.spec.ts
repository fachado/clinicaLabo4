import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosManejoComponent } from './turnos-manejo.component';

describe('TurnosManejoComponent', () => {
  let component: TurnosManejoComponent;
  let fixture: ComponentFixture<TurnosManejoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnosManejoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnosManejoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
