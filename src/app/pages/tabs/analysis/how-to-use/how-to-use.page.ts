import { Component, OnInit, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { WtWood } from "src/app/models/wt-wood";
import { ReportService } from "src/app/services/report.service";
import { UtilsService } from "src/app/services/utils.service";
import { WoodService } from "src/app/services/wood.service";
import SwiperCore, { SwiperOptions, Pagination, Virtual } from "swiper";
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

  helpSlides = [];

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
    console.log(this.slideActive);
  }

  slideNext() {
    this.swiper.swiperRef.slideNext(800);
  }

  slidePrev() {
    this.swiper.swiperRef.slidePrev(800);
  }

  goToRoot() {
    console.log("entendido");
    this.reportService.patchActiveWood(this.reportService.emptyWood);
    this.utilsSvc.routerLink("/tabs/analysis/take-photos");
  }
}
