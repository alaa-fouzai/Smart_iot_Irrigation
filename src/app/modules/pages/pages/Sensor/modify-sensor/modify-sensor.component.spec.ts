import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifySensorComponent } from './modify-sensor.component';

describe('ModifySensorComponent', () => {
  let component: ModifySensorComponent;
  let fixture: ComponentFixture<ModifySensorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifySensorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifySensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
