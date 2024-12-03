import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoTurnosDiaComponentComponent } from './grafico-turnos-dia-component.component';

describe('GraficoTurnosDiaComponentComponent', () => {
  let component: GraficoTurnosDiaComponentComponent;
  let fixture: ComponentFixture<GraficoTurnosDiaComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoTurnosDiaComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoTurnosDiaComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
