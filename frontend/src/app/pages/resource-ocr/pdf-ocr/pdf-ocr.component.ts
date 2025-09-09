import { Component, Input, OnInit } from '@angular/core';
import { PDFDocumentProxy, getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { OcrDataService } from 'src/app/services/ocr-data.service';

GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';

@Component({
  selector: 'app-pdf-ocr',
  templateUrl: './pdf-ocr.component.html',
  styleUrls: ['./pdf-ocr.component.scss'],
})
export class PdfOcrComponent implements OnInit {
  @Input() selectedFiles: File | null = null;

  totalPages: number | null = null;
  error: string | null = null;
  currentPageIndex = 0;
  pageImages: SafeUrl[] = [];
  ocrResults: string[] = [];
  pageBlobs: Blob[] = [];
  maxPages = 30; // Default max pages
  scannedPages: number[] = [];
  foundKeys: string[] = [];
  files: File[] = [];

  isProcessing = false;

  constructor(
    private fastenApiService: FastenApiService,
    private sanitizer: DomSanitizer,
    private ocrDataService: OcrDataService
  ) {}

  ngOnInit(): void {
    if (!this.selectedFiles) {
      console.error('No file input provided for PDF OCR component.');
      return;
    }
    this.loadPdf(this.selectedFiles);
  }

  async loadPdf(incomingFile: File) {
    this.isProcessing = true;
    this.error = null;
    this.pageBlobs = [];

    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf: PDFDocumentProxy = await getDocument(typedArray).promise;

      // Store the file reference
      this.files = [incomingFile];

      const totalPages = pdf.numPages;

      // Limit to maxPages
      this.totalPages = totalPages;
      if (totalPages > this.maxPages) {
        this.error = `PDF has ${totalPages} pages. Only the first ${this.maxPages} will be processed.`;
      }
      const pagesToProcess = Math.min(totalPages, this.maxPages);

      for (let i = 1; i <= pagesToProcess; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png')
        );
        this.pageBlobs.push(blob);

        // Create preview URL for the UI
        const url = URL.createObjectURL(blob);
        this.pageImages.push(this.sanitizer.bypassSecurityTrustUrl(url));
      }

      // Send all pages at once to the backend
      const files = this.pageBlobs.map(
        (b, i) => new File([b], `page-${i + 1}.png`, { type: 'image/png' })
      );
      this.fastenApiService.uploadOcrDocuments(files).subscribe({
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
    };

    reader.readAsArrayBuffer(incomingFile);
  }

  goToNextPage() {
    if (this.currentPageIndex < this.pageImages.length - 1) {
      this.currentPageIndex++;
    }
  }

  goToPreviousPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
    }
  }
}
