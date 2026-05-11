import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private http: HttpClient) {}

  loadProducts() {
    return this.http.get<any[]>('http://localhost:3000/products');
  }

  getMissingProducts() {
    return this.http.get<any>('http://localhost:3000/missing-data');
  }

  getProductionsWithError() {
    return this.http.get<any>('http://localhost:3000/getIncorrectProducts');
  }
}
