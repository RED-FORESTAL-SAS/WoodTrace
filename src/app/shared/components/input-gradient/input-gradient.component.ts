import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

interface Option {
  value: any,
  content: string;
}

@Component({
  selector: 'app-input-gradient',
  templateUrl: './input-gradient.component.html',
  styleUrls: ['./input-gradient.component.scss'],
})
export class InputGradientComponent implements OnInit {

  @Input() formControlValue: FormControl;
  @Input() label: string;
  @Input() type: string;
  @Input() selectOptions: Option[];
  @Input() min: null | string;
  @Input() max: null | string;
  constructor() {

    const selects: any = document.querySelectorAll('.custom-options');

    for (var i = 0; i < selects.length; i++) {
      selects[i].interfaceOptions = {
        cssClass: 'my-custom-interface'
      };
    };
  }

  ngOnInit() { }


}
