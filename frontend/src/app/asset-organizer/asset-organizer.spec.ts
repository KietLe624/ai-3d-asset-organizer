import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetOrganizerComponent } from './asset-organizer';

describe('AssetOrganizerComponent', () => {
  let component: AssetOrganizerComponent;
  let fixture: ComponentFixture<AssetOrganizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetOrganizerComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AssetOrganizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
