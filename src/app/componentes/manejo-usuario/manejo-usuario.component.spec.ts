import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManejoUsuarioComponent } from './manejo-usuario.component';

describe('ManejoUsuarioComponent', () => {
  let component: ManejoUsuarioComponent;
  let fixture: ComponentFixture<ManejoUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManejoUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManejoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
