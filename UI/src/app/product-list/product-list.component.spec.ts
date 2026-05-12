import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductsService } from '../services/products.service';

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;

  beforeEach(async () => {
    productsServiceSpy = jasmine.createSpyObj('ProductsService', [
      'loadProducts',
      'getMissingProducts',
    ]);

    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      providers: [
        { provide: ProductsService, useValue: productsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadData', () => {
    it('sets products and clears loading on success', () => {
      const mockProducts = [{ id: 1, title: 'A', price: 1 }];
      productsServiceSpy.loadProducts.and.returnValue(of(mockProducts));

      component.loadData();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      expect(component.products()).toEqual(mockProducts);
      expect(productsServiceSpy.loadProducts).toHaveBeenCalled();
    });

    it('sets error signal when loadProducts fails', () => {
      productsServiceSpy.loadProducts.and.returnValue(
        throwError(() => new Error('Internal Server Error. Please try later.')),
      );

      component.loadData();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(
        'Internal Server Error. Please try later.',
      );
      expect(component.products()).toEqual([]);
    });
  });

  describe('throwError', () => {
    it('sets error when getMissingProducts fails', () => {
      productsServiceSpy.getMissingProducts.and.returnValue(
        throwError(() => new Error('The requested resource was not found.')),
      );

      component.throwError();

      expect(component.error()).toBe('The requested resource was not found.');
    });
  });
});
