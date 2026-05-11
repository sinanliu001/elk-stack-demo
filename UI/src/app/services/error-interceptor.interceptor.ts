import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, retry, throwError, timer } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    // Retry the request 2 times, with a 1-second delay between attempts
    retry({ count: 2, delay: 1000 }),

    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';

      console.error('Error intercepted:', error);
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Backend returned an unsuccessful response code
        switch (error.status) {
          case 401:
            errorMessage = 'Unauthorized! Please log in again.';
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 500:
            errorMessage = 'Internal Server Error. Please try later.';
            break;
        }
      }

      // Return the error so the component can also react if needed
      return throwError(() => new Error(errorMessage));
    }),
  );
};
