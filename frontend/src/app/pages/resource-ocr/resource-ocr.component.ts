import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-resource-ocr',
  templateUrl: './resource-ocr.component.html',
  styleUrls: ['./resource-ocr.component.scss'],
})
export class ResourceOcrComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      mode: ['pdf', Validators.required], // 'pdf' | 'image' | 'capture'
      maxPages: [
        10,
        [Validators.required, Validators.min(1), Validators.max(30)],
      ],
    });
  }
}