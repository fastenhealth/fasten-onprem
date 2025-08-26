import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-resource-ocr',
  templateUrl: './resource-ocr.component.html',
  styleUrls: ['./resource-ocr.component.scss'],
})
export class ResourceOcrComponent implements OnInit {
  settingsForm: FormGroup;
  startedScan = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      mode: [null],
      file: [null],
    });
  }

  // 📂 Drag & drop file
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.detectFileType(file);
    }
  }

  // Allow drop zone
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // 📂 Manual file select
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.detectFileType(file);
    }
  }

  // 📸 Camera button
  onCameraClick() {
    this.settingsForm.value.mode = 'capture';
  }

  // 🔍 Detect PDF vs Image
  private detectFileType(file: File) {
    if (file.type === 'application/pdf') {
      this.startedScan = true;
      this.settingsForm.patchValue({
        mode: 'pdf',
        file: file,
      });
    } else if (file.type.startsWith('image/')) {
      this.startedScan = true;
      this.settingsForm.patchValue({
        mode: 'image',
        file: file,
      });
    } else {
      console.warn('Unsupported file type:', file.type);
      this.settingsForm.patchValue({
        mode: null,
        file: null,
      });
    }
  }
}