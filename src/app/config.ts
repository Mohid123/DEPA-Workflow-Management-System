import { NgxMonacoEditorConfig } from "ngx-monaco-editor-v2";
import { environment } from "src/environments/environment";

export const AppConfig = {
  appUrl: environment.apiUrl,
  apiUrl: environment.apiUrl
};

export const MonacoConfig: NgxMonacoEditorConfig = {
  onMonacoLoad: (val) => {
    console.log(val)
  }
}
