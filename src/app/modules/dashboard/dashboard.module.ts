import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { AppstoreComponent } from './pages/appstore/appstore.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { MenuCardComponent } from 'src/app/standalone-components/menu-card/menu-card.component';
import { TuiCarouselModule } from '@taiga-ui/kit';
import { TuiButtonModule } from '@taiga-ui/core';
import { StoreCardComponent } from 'src/app/standalone-components/store-card/store-card.component';


@NgModule({
  declarations: [
    DashboardComponent,
    AppstoreComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HeaderComponent,
    MenuCardComponent,
    TuiCarouselModule,
    TuiButtonModule,
    StoreCardComponent
  ]
})
export class DashboardModule { }
