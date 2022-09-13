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
  @Input() icon: string;

  hide: boolean = true;
  isPassword: boolean;
  noInputValues = ['select','button'];

  constructor() {
  }

  ngOnInit() { 

    if(this.type == 'password'){
      this.isPassword = true
    }
    
  }


  showAndHide(){
    this.hide = !this.hide;
    
    if(this.hide){
      this.type = 'password'
    }else{
      this.type = 'text'
    }
    
  }
}
