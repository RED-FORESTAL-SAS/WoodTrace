import { Component, OnInit, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { WtWood } from "src/app/models/wt-wood";
import { ReportService } from "src/app/services/report.service";
import { UtilsService } from "src/app/services/utils.service";
import { SwiperOptions } from "swiper";
import { SwiperComponent } from "swiper/angular";

@Component({
  selector: "app-how-to-use",
  templateUrl: "./how-to-use.page.html",
  styleUrls: ["./how-to-use.page.scss"],
})
export class HowToUsePage implements OnInit {
  @ViewChild("swiper", { static: false }) swiper?: SwiperComponent;

  /** Observable with active report or null. */
  public activeWood$: Observable<WtWood | null>;

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: { clickable: true, bulletActiveClass: "bullet-active" },
  };

  slideActive: number = 0;

  constructor(
    private utilsSvc: UtilsService,
    private reportService: ReportService
  ) {
    this.activeWood$ = this.reportService.activeWood;
  }

  ngOnInit() {}

  onSlideChange(event) {
    let a = event[0].activeIndex;
    this.slideActive = a;
  }

  slideNext() {
    this.swiper.swiperRef.slideNext(800);
  }

  slidePrev() {
    this.swiper.swiperRef.slidePrev(800);
  }

  goToRoot() {
    this.reportService.patchActiveWood(this.reportService.emptyWood);
    this.utilsSvc.routerLink("/tabs/analysis/take-photos");
  }
}
