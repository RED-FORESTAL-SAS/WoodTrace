import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-empty-array',
  templateUrl: './empty-array.component.html',
  styleUrls: ['./empty-array.component.scss'],
})
export class EmptyArrayComponent implements OnInit {

  @Input() iconSrc: string;
  @Input() iconName: string;
  @Input() text: string;

  constructor() { }

  ngOnInit() {}

}
