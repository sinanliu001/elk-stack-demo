import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProducts', () => {
    it('GETs http://localhost:3000/products', () => {
      const mockProducts = [{ id: 1, title: 'Test', price: 9.99 }];
      let result: unknown;

      service.loadProducts().subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne('http://localhost:3000/products');
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);

      expect(result).toEqual(mockProducts);
    });
  });

  describe('getMissingProducts', () => {
    it('GETs missing-data endpoint', () => {
      service.getMissingProducts().subscribe();

      const req = httpMock.expectOne('http://localhost:3000/missing-data');
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getProductionsWithError', () => {
    it('GETs getIncorrectProducts endpoint', () => {
      service.getProductionsWithError().subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/getIncorrectProducts',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ productions: [] });
    });
  });
});
