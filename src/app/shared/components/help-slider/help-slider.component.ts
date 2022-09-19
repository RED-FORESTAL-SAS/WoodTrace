import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { helpSlides } from 'src/assets/data/help-slides';
import SwiperCore, { SwiperOptions, Pagination, Virtual } from 'swiper';
import { SwiperComponent } from 'swiper/angular';


SwiperCore.use([Pagination, Virtual]);

@Component({
  selector: 'app-help-slider',
  templateUrl: './help-slider.component.html',
  styleUrls: ['./help-slider.component.scss'],
})
export class HelpSliderComponent implements OnInit {

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;
 

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: { clickable: true, bulletActiveClass: 'bullet-active'}
  };

  helpSlides = [];

  slideActive: number = 0;
  constructor(private utilsSvc: UtilsService) { }

  ngOnInit() {
    this.helpSlides = helpSlides;
  }

  onSlideChange(event) {
    this.slideActive = event[0].activeIndex
  }
  
  slideNext(){
    this.swiper.swiperRef.slideNext(800);
  }

  slidePrev(){
    this.swiper.swiperRef.slidePrev(800);
  }

  goToRoot(){
    this.utilsSvc.saveLocalStorage('introViewed', true);
    this.utilsSvc.routerLink('/login')
  }
}
