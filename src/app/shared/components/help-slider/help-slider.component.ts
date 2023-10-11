import { Component, ViewChild } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";

import SwiperCore, { SwiperOptions, Pagination, Virtual } from "swiper";
import { SwiperComponent } from "swiper/angular";

SwiperCore.use([Pagination, Virtual]);

@Component({
  selector: "app-help-slider",
  templateUrl: "./help-slider.component.html",
  styleUrls: ["./help-slider.component.scss"],
})
export class HelpSliderComponent {
  @ViewChild("swiper", { static: false }) swiper?: SwiperComponent;

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: { clickable: true, bulletActiveClass: "bullet-active" },
  };

  helpSlides = [
    {
      title: "¡Comencemos!",
      subtitle: "¡Nos encargaremos de analizar la madera por ti!",
      indication: "",
      img: "assets/icon/Fredregistrate.svg",
      message:
        "Ten en cuenta que para realizar los análisis de madera se requiere tener una membresía activa",
    },
    {
      title: "Fotografía de madera",
      subtitle: "Utiliza una lupa con un aumento mínimo de x60",
      indication: "",
      img: "assets/icon/Fotomadera.svg",
      message:
        "Recuerda que el análisis de la madera depende del uso de esta lupa",
    },
    {
      title: "Análisis",
      subtitle:
        "Con una sola foto nuestra inteligencia artifical se encargará del análisis",
      indication: "",
      img: "assets/icon/Analisis.svg",
      message:
        "Podrás identificar y ratificar las maderas siendo transportadas",
    },
    {
      title: "Reportes",
      subtitle: "Crea y guarda los reportes de manera rápida y segura",
      indication: "",
      img: "assets/icon/Reportes.svg",
      message: "Puedes descargar los reportes en cualquier momento.",
    },
    {
      title: "Contáctanos",
      subtitle: "¡Estamos listos para servirte!",
      indication:
        "Puedes hablar con nosotros por medio de nuestro correo electrónico, teléfono y página web.",
      img: "assets/icon/Fredservicio.svg",
      message:
        "Puedes encontrar nuestros datos de contacto dentro del botón de “ayuda” en el menú de tu perfil.",
    },
  ];

  slideActive: number = 0;
  constructor(private utilsSvc: UtilsService) {}

  onSlideChange(event) {
    this.slideActive = event[0].activeIndex;
  }

  slideNext() {
    this.swiper.swiperRef.slideNext(800);
  }

  slidePrev() {
    this.swiper.swiperRef.slidePrev(800);
  }

  goToRoot() {
    this.utilsSvc.saveLocalStorage("introViewed", true);
    this.utilsSvc.routerLink("/login");
  }
}
