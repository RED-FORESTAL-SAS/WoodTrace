import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-gradient',
  templateUrl: './input-gradient.component.html',
  styleUrls: ['./input-gradient.component.scss'],
})
export class InputGradientComponent implements OnInit {

  @Input() formControlValue: FormControl;
  @Input() label: string;
  @Input() type: string;

  constructor() { }

  ngOnInit() {}

}
