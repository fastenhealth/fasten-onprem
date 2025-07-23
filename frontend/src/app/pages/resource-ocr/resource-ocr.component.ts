// In resource-ocr.component.ts

import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FastenApiService } from 'src/app/services/fasten-api.service';

@Component({
  selector: 'app-resource-ocr',
  templateUrl: './resource-ocr.component.html',
  styleUrls: ['./resource-ocr.component.scss']
})
export class ResourceOcrComponent {

  selectedFile: File | null = null;
  ocrResult: string | null = null;
  errorMessage: string | null = null;
  isUploading = false;

  constructor(private apiService: FastenApiService) { }

  /**
   * Captures the file selected by the user.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.ocrResult = null;
      this.errorMessage = null;
    }
  }

  /**
   * Handles the upload process by calling the new service method.
   */
  onUpload(): void {
    if (!this.selectedFile) {
      this.errorMessage = "Please select a file first.";
      return;
    }

    this.isUploading = true;
    this.errorMessage = null;
    this.ocrResult = null;

    // Use the service to handle the upload
    this.apiService.uploadOcrDocument(this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.ocrResult = response;
      },
      error: (err: HttpErrorResponse) => {
        this.isUploading = false;
        // Error handling remains the same
        try {
          const parsedError = JSON.parse(err.error);
          this.errorMessage = parsedError.error || 'An unknown error occurred.';
        } catch (e) {
          this.errorMessage = err.error || 'Failed to communicate with the OCR service.';
        }
        console.error(err);
      }
    });
  }
}