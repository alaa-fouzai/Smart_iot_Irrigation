import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelayConfigComponent } from './relay-config.component';

describe('RelayConfigComponent', () => {
  let component: RelayConfigComponent;
  let fixture: ComponentFixture<RelayConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelayConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelayConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
