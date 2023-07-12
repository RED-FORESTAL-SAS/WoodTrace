import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { AnalysisResultPage } from "./analysis-result.page";

describe("AnalysisResultPage", () => {
  let component: AnalysisResultPage;
  let fixture: ComponentFixture<AnalysisResultPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnalysisResultPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisResultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
