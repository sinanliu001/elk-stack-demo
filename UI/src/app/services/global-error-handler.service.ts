import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ErrorCommunicationService } from './error-communication.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
  constructor(private injector: Injector) {}
  handleError(error: any): void {
    const errorComm = this.injector.get(ErrorCommunicationService);
    errorComm.triggerError();
    // 1. Add a unique prefix to see it in the console
    console.error('--- CUSTOM ERROR CAUGHT ---', error);

    // // 2. Optional: check for specific properties
    // const message = error.message ? error.message : error.toString();

    // // 3. You can also trigger an alert to be 100% sure
    alert('Caught by Custom Handler: ');
  }
}
