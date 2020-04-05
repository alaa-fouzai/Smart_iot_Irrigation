import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemouveSensorComponent } from './remouve-sensor.component';

describe('RemouveSensorComponent', () => {
  let component: RemouveSensorComponent;
  let fixture: ComponentFixture<RemouveSensorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemouveSensorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemouveSensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
