import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { GlobalComponent } from './global/global.component';
import { CleintdemoComponent } from './cleintdemo/cleintdemo.component';
import { ErrorGlobalComponent } from './errorglobal/global.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    component: ProductListComponent,
    title: 'http interceptor demo 1',
  },
  {
    path: 'details',
    component: GlobalComponent,
    title: 'global error handler demo',
  },
  {
    path: 'error-global',
    component: ErrorGlobalComponent,
    title: 'global error handler demo with error boundary',
  },
  {
    path: 'client',
    component: CleintdemoComponent,
    title: 'client side error demo',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
