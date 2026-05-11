import { Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-cleintdemo',
  standalone: false,
  templateUrl: './cleintdemo.component.html',
  styleUrl: './cleintdemo.component.scss',
})
export class CleintdemoComponent {
  userName = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);

  // 2. Signal to track a custom logic error
  logicError = signal<string | null>(null);

  submitForm() {
    if (this.userName.invalid) {
      this.logicError.set('Please fix the form errors before submitting.');
      return;
    }

    try {
      // Simulating a logic error (e.g., trying to process undefined data)
      this.processData(undefined);
      this.logicError.set(null);
    } catch (e) {
      this.logicError.set('Client-side processing failed: Data was missing.');
    }
  }

  private processData(data: any) {
    if (!data) throw new Error('No data provided');
    console.log('Processing...', data);
  }
}
