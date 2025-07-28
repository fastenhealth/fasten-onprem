import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FastenApiService } from 'src/app/services/fasten-api.service';

@Component({
  selector: 'app-image-ocr',
  templateUrl: './image-ocr.component.html',
  styleUrls: ['./image-ocr.component.scss'],
})
export class ImageOcrComponent {
  imageFiles: File[] = [];
  imagePreviews: SafeUrl[] = [];
  currentPageIndex = 0;
  ocrResults: string[] = [];
  error = '';
  isProcessing = false;

  constructor(
    private sanitizer: DomSanitizer,
    private fastenApiService: FastenApiService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    // Validate
    if (files.length > 30) {
      this.error = 'You can only upload up to 30 images.';
      return;
    }

    this.imageFiles = files;
    this.imagePreviews = files.map((file) =>
      this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file))
    );
    this.ocrResults = Array(files.length).fill('');
    this.currentPageIndex = 0;
    this.error = '';
  }

  sendCurrentImageToOcr(): void {
    this.isProcessing = true;
    const currentFile = this.imageFiles[this.currentPageIndex];
    this.fastenApiService.uploadOcrDocument(currentFile).subscribe({
      next: (text: string) => {
        this.ocrResults[this.currentPageIndex] = text;
        this.isProcessing = false;
      },
      error: () => {
        this.error = 'Failed to send image to OCR.';
        this.isProcessing = false;
      },
    });
  }

  goToNextImage(): void {
    if (this.currentPageIndex < this.imageFiles.length - 1)
      this.currentPageIndex++;
  }

  goToPreviousImage(): void {
    if (this.currentPageIndex > 0) this.currentPageIndex--;
  }
}
