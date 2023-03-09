import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { AppstoreComponent } from './pages/appstore/appstore.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { MenuCardComponent } from 'src/app/standalone-components/menu-card/menu-card.component';
import { TuiButtonModule } from '@taiga-ui/core';
import { FooterComponent } from 'src/app/standalone-components/footer/footer.component';
import { AppListingComponent } from './pages/app-listing/app-listing.component';
import { CarouselComponent } from 'src/app/standalone-components/carousel/carousel.component';
import { SharedMenuComponent } from 'src/app/standalone-components/shared-menu/shared-menu.component';


@NgModule({
  declarations: [
    DashboardComponent,
    AppstoreComponent,
    AppListingComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HeaderComponent,
    TuiButtonModule,
    FooterComponent,
    CarouselComponent,
    SharedMenuComponent
  ]
})
export class DashboardModule { }
