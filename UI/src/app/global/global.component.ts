import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-global',
  standalone: false,
  templateUrl: './global.component.html',
  styleUrl: './global.component.scss',
})
export class GlobalComponent {
  service = inject(ProductsService);
  hasError = signal(false);
  products: any = signal([]);

  throwError() {
    this.products.set([]); // Clear products before loading new data
    this.service.getProductionsWithError().subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: (err) => {
        console.error('Caught error in component:', err.message);
        this.hasError.set(true);
      },
      complete: () => console.log('Request completed'),
    });
  }
}
