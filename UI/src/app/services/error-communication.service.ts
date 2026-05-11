import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorCommunicationService {
  errorSource = new BehaviorSubject<boolean>(false);

  getErrorSource() {
    return this.errorSource;
  }

  triggerError() {
    console.log('ErrorCommunicationService: triggerError called');
    this.errorSource.next(true);
  }

  triggerReset() {
    console.log('ErrorCommunicationService: triggerReset called');
    this.errorSource.next(false);
  }
}
