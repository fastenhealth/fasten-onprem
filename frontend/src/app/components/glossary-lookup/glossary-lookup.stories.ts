import type { Meta, StoryObj } from '@storybook/angular';
import {GlossaryLookupComponent} from "./glossary-lookup.component";
import {applicationConfig, moduleMetadata} from "@storybook/angular";
import {importProvidersFrom} from "@angular/core";
import {FastenApiService} from "../../services/fasten-api.service";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {BrowserModule} from "@angular/platform-browser";
import {Observable, of} from "rxjs";
import {ValueSet} from "fhir/r4";
import {CommonModule} from "@angular/common";

class MockHttpClient extends HttpClient {

  get(): Observable<any> {
    console.log("CALLED getGlossarySearchByCode in MockFastenApiService")
    return of({
      url: "https://www.nidcr.nih.gov/health-info/taste-disorders/more-info?utm_source=medlineplus-connect&utm_medium=website&utm_campaign=mlp-connect",
      publisher: "U.S. National Library of Medicine",
      description: "Problems with the sense of taste can have a big impact on life. Taste stimulates the desire to eat and therefore plays a key role in nutrition. The sense of taste also helps keep us healthy by helping us detect spoiled food or drinks.",
    })
  }
}



// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<GlossaryLookupComponent> = {
  title: 'Components/GlossaryLookup',
  component: GlossaryLookupComponent,
  decorators: [
    moduleMetadata({
      imports: [BrowserModule, HttpClientModule],
      providers: [{ provide: HttpClient, useClass: MockHttpClient }],

    }),
    // applicationConfig({
    //   // imports: [BrowserModule, HttpClientModule],
    //   providers: [{ provide: FastenApiService, useValue: MockFastenApiService }],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: GlossaryLookupComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    code: {
      control: 'text',
    },
    codeSystem: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<GlossaryLookupComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    code: "36955009",
    codeSystem: "2.16.840.1.113883.6.96"
  },
};

