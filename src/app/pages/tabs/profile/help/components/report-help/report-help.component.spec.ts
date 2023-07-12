import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { ReportHelpComponent } from "./report-help.component";

describe("ReportHelpComponent", () => {
  let component: ReportHelpComponent;
  let fixture: ComponentFixture<ReportHelpComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ReportHelpComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
