import { Inject, Injectable } from '@angular/core';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';

/**
 * Injectable for handling custom notifications throughout the panel.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  /**
   * @constructor
   * @param {TuiAlertService} alertService
   * TuiAlertService is injected 
   * in order to use it's built in methods for displaying messages.
   * 
   * @see [TuiAlertService]{@link https://taiga-ui.dev/services/alert-service}
   */
  constructor(
    @Inject(TuiAlertService)
    private readonly alertService: TuiAlertService
  ) { }

  /**
   * Function that uses the  `` open ``  method of [TuiAlertService]{@link https://taiga-ui.dev/services/alert-service} to display custom
   * notification
   * 
   * @param {string} message The custom message or notification to display
   * @param {string} label The label or title of the notification
   * @param {TuiNotification} status An enum that shows one of either ``Info``, ``Success``, ``Warning`` or ``Error``
   */
  displayNotification(message: string, label: string, status: TuiNotification) {
    this.alertService.open(message,
    {
      label: label,
      status: status,
      autoClose: true,
      hasIcon: true
    }
      ).subscribe();
  }
}