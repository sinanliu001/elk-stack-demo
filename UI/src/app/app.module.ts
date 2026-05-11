import { NgModule, ErrorHandler } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductListComponent } from './product-list/product-list.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './services/error-interceptor.interceptor';
import { GlobalErrorHandlerService } from './services/global-error-handler.service';
import { GlobalComponent } from './global/global.component';
import { ErrorboundaryComponent } from './errorboundary/errorboundary.component';
import { CleintdemoComponent } from './cleintdemo/cleintdemo.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorGlobalComponent } from './errorglobal/global.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    GlobalComponent,
    ErrorboundaryComponent,
    ErrorGlobalComponent,
    CleintdemoComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [
    provideHttpClient(withInterceptors([errorInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
