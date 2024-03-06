import {Directive, ElementRef, HostListener, Input} from '@angular/core';

const DEFAULT_IMAGE_FALLBACK_PATH: string = '/assets/images/no-image.svg';

@Directive({
  selector: 'img[imageFallback]'
})
export class ImageFallbackDirective {

  @Input() imageFallback?: string;
  constructor(private elementRef: ElementRef) {}

  @HostListener('error')
  loadFallbackOnError() {
    // Check to see if we have already tried to load the fallback image.
    // Avoids endless loop if for some reason fallback image is missing. Just accept the broken image.
    if (this.path(this.elementRef.nativeElement.src) == this.path(this.fallbackSrc())) {
      return;
    }

    this.elementRef.nativeElement.src = this.fallbackSrc();
  }

  private fallbackSrc(): string {
    return this.imageFallback || DEFAULT_IMAGE_FALLBACK_PATH;
  }

  private path(urlString: string): string {
    // remove http(s) and domain
    return urlString.replace(/^https?:\/\/[^\/]*/, '');
  }

}
