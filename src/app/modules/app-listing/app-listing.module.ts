import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppListingRoutingModule } from './app-listing-routing.module';
import { AppListingComponent } from './app-listing.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { FooterComponent } from 'src/app/standalone-components/footer/footer.component';
import { TableViewComponent } from 'src/app/standalone-components/table-view/table-view.component';
import { SearchBarComponent } from 'src/app/standalone-components/search-bar/search-bar.component';


@NgModule({
  declarations: [
    AppListingComponent,
    CompaniesComponent
  ],
  imports: [
    CommonModule,
    AppListingRoutingModule,
    HeaderComponent,
    FooterComponent,
    TableViewComponent,
    SearchBarComponent
  ]
})
export class AppListingModule { }
