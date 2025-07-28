import { Component, Input, OnInit } from '@angular/core';
import { PDFDocumentProxy, getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { RenderParameters } from 'pdfjs-dist/types/src/display/api';

GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';

@Component({
  selector: 'app-pdf-ocr',
  templateUrl: './pdf-ocr.component.html',
  styleUrls: ['./pdf-ocr.component.scss'],
})
export class PdfOcrComponent implements OnInit {
  @Input() maxPages = 30;

  pdfFile: File | null = null;
  totalPages: number | null = null;
  error: string | null = null;
  currentPageIndex = 0;
  pageImages: SafeUrl[] = [];
  ocrResults: string[] = [];
  pageBlobs: Blob[] = [];

  isProcessing = false;
  scanningStarted = false;

  constructor(
    private sanitizer: DomSanitizer,
    private fastenApiService: FastenApiService
  ) {}

  ngOnInit(): void {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file && file.type === 'application/pdf') {
      this.pdfFile = file;
      this.loadPdf(file);
    } else {
      this.error = 'Please select a valid PDF file.';
    }
  }

  async loadPdf(file: File) {
    this.pageImages = [];
    this.pageBlobs = [];
    this.error = null;

    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf: PDFDocumentProxy = await getDocument(typedArray).promise;

      this.totalPages = pdf.numPages;

      if (this.totalPages > this.maxPages) {
        this.error = `PDF has ${this.totalPages} pages. Maximum allowed is ${this.maxPages}.`;
        return;
      }

      for (let i = 1; i <= this.totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        } as RenderParameters).promise;

        // Convert to Blob and store
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png')
        );
        this.pageBlobs.push(blob);

        // Also keep a previewable URL
        const url = URL.createObjectURL(blob);
        this.pageImages.push(this.sanitizer.bypassSecurityTrustUrl(url));
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async sendCurrentPageToOcr() {
    this.isProcessing = true;

    const currentBlob = this.pageBlobs[this.currentPageIndex];
    const file = new File(
      [currentBlob],
      `page-${this.currentPageIndex + 1}.png`,
      {
        type: 'image/png',
      }
    );

    this.fastenApiService.uploadOcrDocument(file).subscribe({
      next: (resultText) => {
        this.ocrResults[this.currentPageIndex] = resultText;
        this.isProcessing = false;
      },
      error: (err) => {
        this.ocrResults[this.currentPageIndex] = '[Error during OCR]';
        this.isProcessing = false;
      },
    });
  }

  startScanning() {
    this.scanningStarted = true;
    this.currentPageIndex = 0;
    this.ocrResults = new Array(this.pageImages.length).fill('');
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
