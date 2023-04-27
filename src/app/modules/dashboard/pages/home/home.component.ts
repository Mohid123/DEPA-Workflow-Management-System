import { Component } from '@angular/core';
@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent {
  Arr = Array;
  num: number = 7;

  length = 20;
  index = 0;

  goToPage(index: number): void {
    this.index = index;
    console.info('New page:', index);
  }

  constructor() {
  }

}
