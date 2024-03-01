import { ElementRef } from '@angular/core';
import { ImageFallbackDirective } from './image-fallback.directive';

describe('ImageFallbackDirective', () => {
  it('should create an instance', () => {
    const directive = new ImageFallbackDirective(new ElementRef('img'));
    expect(directive).toBeTruthy();
  });
});
