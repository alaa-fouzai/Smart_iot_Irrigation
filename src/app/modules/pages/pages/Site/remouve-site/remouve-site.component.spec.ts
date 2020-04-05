import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemouveSiteComponent } from './remouve-site.component';

describe('RemouveSiteComponent', () => {
  let component: RemouveSiteComponent;
  let fixture: ComponentFixture<RemouveSiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemouveSiteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemouveSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
