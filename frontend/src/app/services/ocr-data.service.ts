import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OcrDataService {
  private ocrDataSubject = new BehaviorSubject<any>({});
  ocrData$ = this.ocrDataSubject.asObservable();

  /** Merge new OCR results into existing state */
  updateOcrData(newData: any) {
    const currentData = this.ocrDataSubject.value;
    this.ocrDataSubject.next({
      ...currentData,
      ...newData,
    });
  }

  /** Get latest snapshot of OCR data */
  getOcrData() {
    return this.ocrDataSubject.value;
  }

  /** Reset OCR state */
  clearOcrData() {
    this.ocrDataSubject.next({});
  }

  /**
   * Returns an array of found keys (top-level and optionally nested) from the OCR result.
   */
  extractFoundKeys(obj: any, prefix = ''): string[] {
    if (!obj) return [];

    const keys: string[] = [];

    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        value &&
        (typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean')
      ) {
        keys.push(fullKey);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively extract nested keys
        keys.push(...this.extractFoundKeys(value, fullKey));
      }
    });

    return keys;
  }
}
