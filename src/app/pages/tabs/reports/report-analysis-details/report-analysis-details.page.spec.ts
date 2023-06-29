import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { ReportAnalysisDetailsPage } from "./report-analysis-details.page";

describe("ReportAnalysisDetailsPage", () => {
  let component: ReportAnalysisDetailsPage;
  let fixture: ComponentFixture<ReportAnalysisDetailsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ReportAnalysisDetailsPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportAnalysisDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
