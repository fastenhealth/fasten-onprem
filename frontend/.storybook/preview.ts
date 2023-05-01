import type { Preview } from "@storybook/angular";
import { setCompodocJson } from "@storybook/addon-docs/angular";
import docJson from "../documentation.json";
import {applicationConfig} from "@storybook/angular";
import {importProvidersFrom} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
setCompodocJson(docJson);

// see: https://github.com/storybookjs/storybook/issues/21942#issuecomment-1516177565
const decorators = [
  // applicationConfig({
  //   providers: [importProvidersFrom(HttpClientModule)]
  // })
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: decorators
};

export default preview;
