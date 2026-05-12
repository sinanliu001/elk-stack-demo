import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandlerService } from './global-error-handler.service';
import { ErrorCommunicationService } from './error-communication.service';

describe('GlobalErrorHandlerService', () => {
  let handler: GlobalErrorHandlerService;
  let errorComm: ErrorCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalErrorHandlerService, ErrorCommunicationService],
    });
    handler = TestBed.inject(GlobalErrorHandlerService);
    errorComm = TestBed.inject(ErrorCommunicationService);
    spyOn(console, 'error');
    spyOn(window, 'alert');
    spyOn(errorComm, 'triggerError').and.callThrough();
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('notifies ErrorCommunicationService and surfaces the error', () => {
    const err = new Error('unit test error');

    handler.handleError(err);

    expect(errorComm.triggerError).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      '--- CUSTOM ERROR CAUGHT ---',
      err,
    );
    expect(window.alert).toHaveBeenCalledWith('Caught by Custom Handler: ');
  });
});
