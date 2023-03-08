import { Inject, Injectable } from '@angular/core';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(
    @Inject(TuiAlertService)
    private readonly alertService: TuiAlertService
  ) { }

  displayNotification(message: string, label: string, status: TuiNotification) {
    this.alertService.open(message,
    {
      label: label,
      status: status,
      autoClose: true
    }
      ).subscribe();
  }
}
