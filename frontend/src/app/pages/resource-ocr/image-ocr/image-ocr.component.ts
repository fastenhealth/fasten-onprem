import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { OcrDataService } from 'src/app/services/ocr-data.service';

@Component({
  selector: 'app-image-ocr',
  templateUrl: './image-ocr.component.html',
  styleUrls: ['./image-ocr.component.scss'],
})
export class ImageOcrComponent {
  @Input() selectedFiles: File[] | null = null;

  imageFiles: File[] = [];
  imagePreviews: SafeUrl[] = [];
  currentPageIndex = 0;
  ocrResults: string[] = [];
  error = '';
  isProcessing = false;
  foundKeys: string[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private fastenApiService: FastenApiService,
    private ocrDataService: OcrDataService
  ) {}

  ngOnInit(): void {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      this.error = 'No files selected.';
      return;
    }
    this.loadFiles();
  }

  loadFiles(): void {
    const files = Array.from(this.selectedFiles || []).filter((file) =>
      file.type.startsWith('image/')
    );

    // Validate
    if (files.length > 30) {
      this.error = 'You can only upload up to 30 images.';
      return;
    }

    if (!files.length) {
      this.error = 'No valid image files selected.';
      return;
    }

    this.imageFiles = files;
    this.imagePreviews = files.map((file) =>
      this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file))
    );
    this.ocrResults = Array(files.length).fill('');
    this.currentPageIndex = 0;
    this.error = '';
    this.isProcessing = true;

    // Send all images to the backend
    this.fastenApiService.uploadOcrDocuments(this.imageFiles).subscribe({
      next: (result) => {
        let parsedResult: any;
        try {
          parsedResult = JSON.parse(result);
        } catch {
          parsedResult = result;
        }

        this.ocrDataService.updateOcrData(parsedResult);
        this.foundKeys = this.ocrDataService.extractFoundKeys(parsedResult);
        this.isProcessing = false;
      },
      error: () => {
        this.ocrDataService.updateOcrData({ error: '[Error during OCR]' });
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
