import { Component, ElementRef, ViewChild } from '@angular/core';
import { FastenApiService } from 'src/app/services/fasten-api.service';
@Component({
  selector: 'app-camera-ocr',
  templateUrl: './camera-ocr.component.html',
  styleUrls: ['./camera-ocr.component.scss'],
})
export class CameraOcrComponent {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  isCameraReady = false;
  capturedImages: string[] = [];
  ocrResults: string[] = [];
  currentIndex = 0;
  isProcessing = false;
  error: string | null = null;
  isCapturingNew = true;

  constructor(private fastenApiService: FastenApiService) {}

  ngAfterViewInit() {
    this.initCamera();
  }

  async initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoRef.nativeElement.srcObject = stream;
      this.videoRef.nativeElement.play();
      this.isCameraReady = true;
    } catch (err) {
      this.error = 'Failed to access camera.';
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
      this.ocrResults.push('');
      this.currentIndex = this.capturedImages.length - 1;
      this.isCapturingNew = false; // Go back to preview mode
    }
  }

  sendToOcr() {
    this.isProcessing = true;
    this.error = null;

    // Convert base64 to Blob
    fetch(this.capturedImages[this.currentIndex])
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `capture-${this.currentIndex + 1}.png`, {
          type: 'image/png',
        });
        this.fastenApiService.uploadOcrDocument(file).subscribe({
          next: (result) => {
            this.ocrResults[this.currentIndex] = result;
            this.isProcessing = false;
          },
          error: () => {
            this.error = 'OCR failed.';
            this.isProcessing = false;
          },
        });
      });
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
    }
  }
}
