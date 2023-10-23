import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TuiNotificationModule, TUI_SANITIZER } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CoreModule } from "src/core/core.module";
import { FormioAppConfig } from "@formio/angular";
import { AppConfig, MonacoConfig } from "./config";
import { TuiPreviewModule } from "@taiga-ui/addon-preview";
import { EmailSubmissionComponent } from "./modules/workflows/email-submission/email-submission.component";
import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG, NgxMonacoEditorConfig } from "ngx-monaco-editor-v2";
@NgModule({
  declarations: [
    AppComponent,
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
    TuiDialogModule,
    TuiPreviewModule,
    TuiNotificationModule,
    EmailSubmissionComponent,
    MonacoEditorModule.forRoot()
],
  providers: [
    // {provide: TUI_SANITIZER, useClass: NgDompurifySanitizer},
    { provide: FormioAppConfig, useValue: AppConfig },
    { provide: NGX_MONACO_EDITOR_CONFIG, useValue: MonacoConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
