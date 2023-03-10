import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { AppstoreComponent } from './pages/appstore/appstore.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { TuiButtonModule, TuiTextfieldControllerModule, TuiLoaderModule } from '@taiga-ui/core';
import { FooterComponent } from 'src/app/standalone-components/footer/footer.component';
import { AppListingComponent } from './pages/app-listing/app-listing.component';
import { CarouselComponent } from 'src/app/standalone-components/carousel/carousel.component';
import { SharedMenuComponent } from 'src/app/standalone-components/shared-menu/shared-menu.component';
import {TuiTableModule} from '@taiga-ui/addon-table';
import {TuiLetModule} from '@taiga-ui/cdk';
import { TuiInputModule, TuiPaginationModule, TuiTabsModule, TuiTextAreaModule, TuiMultiSelectModule, TuiDataListWrapperModule } from '@taiga-ui/kit';
import { PublishAppComponent } from './pages/publish-app/publish-app.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AppstoreComponent,
    AppListingComponent,
    PublishAppComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HeaderComponent,
    TuiButtonModule,
    FooterComponent,
    CarouselComponent,
    SharedMenuComponent,
    TuiTableModule,
    TuiPaginationModule,
    TuiLetModule,
    TuiTabsModule,
    ReactiveFormsModule,
    FormsModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiTextAreaModule,
    TuiMultiSelectModule,
    TuiDataListWrapperModule,
    TuiLoaderModule
  ]
})
export class DashboardModule { }
