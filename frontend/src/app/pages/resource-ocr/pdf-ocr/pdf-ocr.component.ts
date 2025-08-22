import { Component, Input, OnInit } from '@angular/core';
import { PDFDocumentProxy, getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { RenderParameters } from 'pdfjs-dist/types/src/display/api';
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

  isProcessing = false;
  scanningStarted = false;

  constructor(
    private sanitizer: DomSanitizer,
    private fastenApiService: FastenApiService,
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
    reader.readAsArrayBuffer(incomingFile);
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
      next: (result) => {
        let parsedResult: any;

        try {
          // if backend returns stringified JSON
          parsedResult = JSON.parse(result);
        } catch {
          // if it’s already JSON
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

    this.scannedPages.push(this.currentPageIndex);
    //TODO: Remove this after testing
    this.ocrDataService.ocrData$.subscribe((data) => {
      console.log('OCR updated:', data);
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
