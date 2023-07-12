import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { AnalysisDetailsPage } from "./analysis-details.page";

describe("AnalysisDetailsPage", () => {
  let component: AnalysisDetailsPage;
  let fixture: ComponentFixture<AnalysisDetailsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnalysisDetailsPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
