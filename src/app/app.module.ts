import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CoreModule } from "src/core/core.module";
import { FormioAppConfig } from "@formio/angular";
import { AppConfig } from "./config";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
      BrowserAnimationsModule,
      TuiRootModule,
      TuiDialogModule,
      TuiAlertModule,
      TuiDialogModule
],
  providers: [
    {provide: TUI_SANITIZER, useClass: NgDompurifySanitizer},
    {provide: FormioAppConfig, useValue: AppConfig},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
