import { Component, Input, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() title: string;
  @Input() backButton: string; //Receive a route to go back
  @Input() closeModal: any;

  constructor(private utilsSvc: UtilsService) { }

  ngOnInit() {}


}
