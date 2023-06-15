import { Component, OnInit, ViewChild } from "@angular/core";
import SwiperCore, { SwiperOptions, Pagination, Virtual } from "swiper";
import { SwiperComponent } from "swiper/angular";

@Component({
  selector: "app-how-to-use",
  templateUrl: "./how-to-use.page.html",
  styleUrls: ["./how-to-use.page.scss"],
})
export class HowToUsePage implements OnInit {
  @ViewChild("swiper", { static: false }) swiper?: SwiperComponent;

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: { clickable: true, bulletActiveClass: "bullet-active" },
  };

  helpSlides = [];

  slideActive: number = 0;

  constructor() {}

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
}
