import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: 'img[imageFallback]'
})
export class ImageFallbackDirective {

  @Input() imageFallback?: string;
  constructor(private elementRef: ElementRef) {}

  @HostListener('error')
  loadFallbackOnError() {
    this.elementRef.nativeElement.src = this.imageFallback || 'assets/images/no-image.svg';
  }

}
