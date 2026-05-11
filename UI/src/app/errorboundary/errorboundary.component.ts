import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { ErrorCommunicationService } from '../services/error-communication.service';

@Component({
  selector: 'app-errorboundary',
  standalone: false,
  templateUrl: './errorboundary.component.html',
  styleUrl: './errorboundary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorboundaryComponent implements OnInit, OnDestroy {
  hasError = false;
  private sub!: Subscription;

  constructor(
    private errorComm: ErrorCommunicationService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.sub = this.errorComm.getErrorSource().subscribe((value) => {
      console.log('ErrorboundaryComponent: errorDetected$ emitted', value);
      this.hasError = value;
      console.log('ErrorboundaryComponent: hasError set to', this.hasError);
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
