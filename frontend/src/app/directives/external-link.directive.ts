import {Directive, HostBinding, HostListener, Input} from '@angular/core';
import {environment} from '../../environments/environment';

// In desktop mode external links can allow the user to navigate away from the app, without any means to return.
// We can prevent this by forcing all external links to open in a new tab
//
// references:
// https://www.educative.io/answers/how-to-open-a-link-in-a-new-tab-with-html-and-javascript
// https://stackoverflow.com/questions/42775017/angular-2-redirect-to-an-external-url-and-open-in-a-new-tab
// https://coryrylan.com/blog/managing-external-links-safely-in-angular
// https://stackoverflow.com/questions/58862558/angular-directive-cannot-attach-event-listener-to-element
// https://github.com/wailsapp/wails/issues/2691
@Directive({
  selector: '[externalLink]'
})
export class ExternalLinkDirective {
  // @HostBinding('attr.rel') relAttr = '';
  // @HostBinding('attr.target') targetAttr = '';
  // @HostBinding('attr.href') hrefAttr = '';
  // @Input() href: string;

  // ngOnChanges() {
  //   this.hrefAttr = this.href;
  //
  //   if (this.isLinkExternal()) {
  //     this.relAttr = 'noopener';
  //     this.targetAttr = '_blank';
  //   }
  //   console.log("Checking if link is external", this.href)
  // }
  //
  // private isLinkExternal() {
  //   return !this.href.includes(location.hostname);
  // }

  @HostListener("click", ["$event"])
  onClick(event: MouseEvent) {
    event.preventDefault();

    let url: string = (<any>event.currentTarget).getAttribute("href");

    //check if wails exists and is defined

    if(typeof wails !== "undefined" && environment.environment_desktop){
      wails.CallByName("pkg.AppService.BrowserOpenURL", url)
    } else{
      window.open(url, "_blank");
    }
  }

}
