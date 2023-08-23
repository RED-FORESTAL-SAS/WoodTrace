import { Component, Input, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";

interface Option {
  value: any;
  content: string;
}

@Component({
  selector: "app-input-datapicker",
  templateUrl: "./input-datapicker.component.html",
  styleUrls: ["./input-datapicker.component.scss"],
})
export class InputDatapickerComponent implements OnInit {
  @Input() formControlValue: FormControl;
  @Input() label: string;
  @Input() type: string;
  @Input() selectOptions: Option[];
  @Input() min: null | string;
  @Input() max: null | string;
  @Input() icon: string;

  public dateExample: string;

  hide: boolean = true;
  isPassword: boolean;
  isDate: boolean;
  noInputTypes = ["select", "button", "currency"];
  mask = { prefix: "COP    ", thousands: ".", decimal: ",", align: "left" };
  constructor() {
    const fNacimientoString = this.formControlValue.value.toISOString();
    this.dateExample = fNacimientoString;
  }

  ngOnInit() {
    if (this.type == "password") {
      this.isPassword = true;
    }

    if (this.type == "date") {
      this.isDate = true;
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
