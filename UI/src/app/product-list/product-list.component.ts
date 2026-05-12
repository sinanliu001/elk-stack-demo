import { Component, signal, inject } from '@angular/core';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {
  products = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  service = inject(ProductsService);

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.service.loadProducts().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  throwError() {
    this.service.getMissingProducts().subscribe({
      next: (data) => {
        console.log('Data:', data);
        this.products.set(data);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  testAsyncError() {
    setTimeout(() => {
      throw new Error('Async Test Error');
    }, 1000);
  }
}
