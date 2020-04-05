import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifySiteComponent } from './modify-site.component';

describe('ModifySiteComponent', () => {
  let component: ModifySiteComponent;
  let fixture: ComponentFixture<ModifySiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifySiteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifySiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
