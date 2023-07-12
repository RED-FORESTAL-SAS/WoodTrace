import { Component, Input, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-input-costum",
  templateUrl: "./input-costum.component.html",
  styleUrls: ["./input-costum.component.scss"],
})
export class InputCostumComponent implements OnInit {
  @Input() formControlValue: FormControl;
  @Input() label: string;
  @Input() type: string;
  @Input() selectOptions: Array<any>;
  @Input() viewField: string;
  @Input() valueField: string;
  @Input() option: string;
  @Input() min: null | string;
  @Input() max: null | string;
  @Input() icon: string;

  hide: boolean = true;
  isPassword: boolean;
  noInputTypes = ["select", "button", "currency"];
  mask = { prefix: "COP    ", thousands: ".", decimal: ",", align: "left" };
  constructor() {}

  ngOnInit() {
    if (this.type == "password") {
      this.isPassword = true;
    }
  }

  showAndHide() {
    this.hide = !this.hide;

    if (this.hide) {
      this.type = "password";
    } else {
      this.type = "text";
    }
  }
}
