import { NgModule } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

// Taken from https://stackoverflow.com/questions/55328832/testing-components-with-font-awesome-icons-module
@NgModule({
  imports: [ FontAwesomeModule ],
  exports: [ FontAwesomeModule ]
})
export class IconsModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
