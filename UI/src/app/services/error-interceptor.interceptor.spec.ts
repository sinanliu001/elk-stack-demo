import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { errorInterceptor } from './error-interceptor.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    spyOn(console, 'error');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('passes through successful responses unchanged', () => {
    let body: unknown;
    http.get('/demo').subscribe((res) => {
      body = res;
    });

    const req = httpMock.expectOne('/demo');
    req.flush({ ok: true });

    expect(body).toEqual({ ok: true });
  });

  it('maps HTTP 404 to a friendly message after retries complete', fakeAsync(() => {
    let message = '';
    http.get('/missing').subscribe({
      error: (err: Error) => {
        message = err.message;
      },
    });

    httpMock.expectOne('/missing').flush('', {
      status: 404,
      statusText: 'Not Found',
    });
    tick(1000);

    httpMock.expectOne('/missing').flush('', {
      status: 404,
      statusText: 'Not Found',
    });
    tick(1000);

    httpMock.expectOne('/missing').flush('', {
      status: 404,
      statusText: 'Not Found',
    });

    expect(message).toBe('The requested resource was not found.');
  }));

  it('maps HTTP 500 to a friendly message after retries complete', fakeAsync(() => {
    let message = '';
    http.get('/fail').subscribe({
      error: (err: Error) => {
        message = err.message;
      },
    });

    httpMock.expectOne('/fail').flush('', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    tick(1000);

    httpMock.expectOne('/fail').flush('', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    tick(1000);

    httpMock.expectOne('/fail').flush('', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(message).toBe('Internal Server Error. Please try later.');
  }));
});
