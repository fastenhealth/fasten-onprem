import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FastenApiService } from 'src/app/services/fasten-api.service';

@Component({
  selector: 'app-resource-ocr',
  templateUrl: './resource-ocr.component.html',
  styleUrls: ['./resource-ocr.component.scss'],
})
export class ResourceOcrComponent {
  selectedFile: File | null = null;
  ocrResult: string | null = null;
  errorMessage: string | null = null;
  isUploading = false;

  constructor(private apiService: FastenApiService) {}

  // Camera and Capture
  videoStream: MediaStream | null = null;
  showCamera = false;
  videoElement!: HTMLVideoElement;
  canvasElement!: HTMLCanvasElement;
  snapshotDataUrl: string | null = null;

  startCamera(): void {
    this.ocrResult = null;
    this.errorMessage = null;
    this.snapshotDataUrl = null;

    this.showCamera = true;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.videoStream = stream;
        this.videoElement = document.querySelector('#videoElement')!;
        this.videoElement.srcObject = stream;
        this.videoElement.play();
      })
      .catch((err) => {
        this.errorMessage = 'Unable to access camera: ' + err;
      });
  }

  captureSnapshot(): void {
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;

    const ctx = this.canvasElement.getContext('2d');
    if (ctx) {
      ctx.drawImage(this.videoElement, 0, 0);
      this.snapshotDataUrl = this.canvasElement.toDataURL('image/jpeg');
      this.stopCamera();
    } else {
      this.errorMessage = 'Unable to access canvas context.';
    }
  }

  stopCamera(): void {
    this.showCamera = false;
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }
  }

  sendSnapshotToOcr(): void {
    if (!this.snapshotDataUrl) return;

    const blob = this.dataURItoBlob(this.snapshotDataUrl);
    const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' });
    this.selectedFile = file;

    this.onUpload();
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.ocrResult = null;
      this.errorMessage = null;
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first.';
      return;
    }

    this.isUploading = true;
    this.errorMessage = null;
    this.ocrResult = null;

    this.apiService.uploadOcrDocument(this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.ocrResult = response;
      },
      error: (err: HttpErrorResponse) => {
        this.isUploading = false;
        try {
          const parsedError = JSON.parse(err.error);
          this.errorMessage = parsedError.error || 'An unknown error occurred.';
        } catch (e) {
          this.errorMessage =
            err.error || 'Failed to communicate with the OCR service.';
        }
        console.error(err);
      },
    });
  }
}