import { Component, ElementRef, ViewChild } from '@angular/core';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { OcrDataService } from 'src/app/services/ocr-data.service';
@Component({
  selector: 'app-camera-ocr',
  templateUrl: './camera-ocr.component.html',
  styleUrls: ['./camera-ocr.component.scss'],
})
export class CameraOcrComponent {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  capturedImages: string[] = [];
  ocrResults: string[] = [];
  currentIndex = 0;
  isProcessing = false;
  error: string | null = null;
  isCapturingNew = true;
  ocrFiles: File[] = [];
  foundKeys: string[] = [];
  private stream: MediaStream | null = null;

  constructor(
    private fastenApiService: FastenApiService,
    private ocrDataService: OcrDataService
  ) {}

  ngAfterViewInit() {
    this.initCamera();
  }

  async initCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoRef.nativeElement.srcObject = this.stream;
      this.videoRef.nativeElement.play();
    } catch (err) {
      this.error = 'Failed to access camera.';
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  captureImage() {
    if (this.capturedImages.length >= 30) return;

    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png');
      this.capturedImages.push(imageData);
      this.currentIndex = this.capturedImages.length - 1;
      this.isCapturingNew = false;
    }
  }

  async sendAllToOcr() {
    if (!this.capturedImages.length) return;

    this.isProcessing = true;
    this.error = null;
    this.stopCamera();

    try {
      // Convert all captured images to File objects
      const files: File[] = await Promise.all(
        this.capturedImages.map((img, i) =>
          fetch(img)
            .then((res) => res.blob())
            .then(
              (blob) =>
                new File([blob], `capture-${i + 1}.png`, { type: 'image/png' })
            )
        )
      );

      // Send all images to the backend
      this.fastenApiService.uploadOcrDocuments(files).subscribe({
        next: (result) => {
          let parsedResult: any;
          try {
            parsedResult = JSON.parse(result);
          } catch {
            parsedResult = result;
          }

          // Store files for the encounter form
          this.ocrFiles = files;
          this.ocrDataService.updateOcrData(parsedResult);
          this.foundKeys = this.ocrDataService.extractFoundKeys(parsedResult);
          this.isProcessing = false;
          this.isCapturingNew = false;
          this.currentIndex = 0;
          this.isProcessing = false;
        },
        error: () => {
          this.ocrDataService.updateOcrData({ error: '[Error during OCR]' });
          this.isProcessing = false;
        },
      });
    } catch (err) {
      console.error(err);
      this.error = 'Failed to prepare images for OCR.';
      this.isProcessing = false;
    }
  }

  goToPrevious() {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  goToNext() {
    if (this.currentIndex < this.capturedImages.length - 1) this.currentIndex++;
  }

  prepareNewCapture() {
    if (this.capturedImages.length < 30) {
      this.isCapturingNew = true;
      this.initCamera();
      this.error = null;
    }
  }
}
