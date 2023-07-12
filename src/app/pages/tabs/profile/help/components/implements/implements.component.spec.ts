import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { ImplementsComponent } from "./implements.component";

describe("ImplementsComponent", () => {
  let component: ImplementsComponent;
  let fixture: ComponentFixture<ImplementsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ImplementsComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ImplementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
