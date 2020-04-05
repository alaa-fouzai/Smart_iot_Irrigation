import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowSitesComponent } from './show-sites.component';

describe('ShowSitesComponent', () => {
  let component: ShowSitesComponent;
  let fixture: ComponentFixture<ShowSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowSitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
