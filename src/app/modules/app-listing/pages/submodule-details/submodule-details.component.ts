import { Component } from '@angular/core';
import { emailLoginForm } from 'src/app/forms-schema/forms';

@Component({
  templateUrl: './submodule-details.component.html',
  styleUrls: ['./submodule-details.component.scss']
})
export class SubmoduleDetailsComponent {
  formTabs: any[] = [];
  activeIndex: number = 0;
  formWithWorkflow: any = [emailLoginForm];
  carouselIndex = 0;
  value = 30

  readonly items = [
    'John Cleese',
    'Eric Idle',
    'Michael Palin',
    'Graham Chapman',
    'Terry Gilliam',
    'Terry Jones',
  ];
}
