import type { Meta, StoryObj } from '@storybook/angular';
import {fhirVersions} from "../../../../../lib/models/constants";
import R4ExampleJpegJson from "../../../../../lib/fixtures/r4/resources/binary/exampleJpeg.json";
import R4ExampleHtmlJson from "../../../../../lib/fixtures/r4/resources/binary/exampleHtml.json";
import R4ExampleDicomJson from "../../../../../lib/fixtures/r4/resources/binary/exampleDicom.json";
import R4ExamplePdfJson from "../../../../../lib/fixtures/r4/resources/binary/examplePdf.json";
import R4ExampleTextJson from "../../../../../lib/fixtures/r4/resources/binary/exampleText.json";
import R4ExampleXmlJson from "../../../../../lib/fixtures/r4/resources/binary/exampleXml.json";
import {BinaryComponent} from "./binary.component";
import {BinaryModel} from "../../../../../lib/models/resources/binary-model";
import {moduleMetadata} from "@storybook/angular";
import {BrowserModule} from "@angular/platform-browser";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {CommonModule} from "@angular/common";



// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<BinaryComponent> = {
  title: 'Fhir/Binary',
  component: BinaryComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, HttpClientModule],
      providers: [{ provide: HttpClient, useClass: HttpClient }],
    }),
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: BinaryComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    displayModel: {
      control: 'object',
    },
    showDetails: {
      control: 'boolean',
    }
  },
};

export default meta;
type Story = StoryObj<BinaryComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
let r4ExampleJpegDisplayModel =  new BinaryModel(R4ExampleJpegJson, fhirVersions.R4)
r4ExampleJpegDisplayModel.source_id = '123-456-789'
r4ExampleJpegDisplayModel.source_resource_id = '123-456-789'
export const R4ExampleJpeg: Story = {
  args: {
    displayModel: r4ExampleJpegDisplayModel
  }
};

let r4ExampleHtmlDisplayModel =  new BinaryModel(R4ExampleHtmlJson, fhirVersions.R4)
r4ExampleHtmlDisplayModel.source_id = '123-456-789'
r4ExampleHtmlDisplayModel.source_resource_id = '123-456-789'
export const R4ExampleHtml: Story = {
  args: {
    displayModel: r4ExampleHtmlDisplayModel
  }
};

let r4ExampleDicomDisplayModel =  new BinaryModel(R4ExampleDicomJson, fhirVersions.R4)
r4ExampleDicomDisplayModel.source_id = '123-456-789'
r4ExampleDicomDisplayModel.source_resource_id = '123-456-789'
export const R4ExampleDicom: Story = {
  args: {
    displayModel: r4ExampleDicomDisplayModel
  }
};

let r4ExamplePdfDisplayModel =  new BinaryModel(R4ExamplePdfJson, fhirVersions.R4)
r4ExamplePdfDisplayModel.source_id = '123-456-789'
r4ExamplePdfDisplayModel.source_resource_id = '123-456-789'
export const R4ExamplePdf: Story = {
  args: {
    displayModel: r4ExamplePdfDisplayModel
  }
};

let r4ExampleTextDisplayModel =  new BinaryModel(R4ExampleTextJson, fhirVersions.R4)
r4ExampleTextDisplayModel.source_id = '123-456-789'
r4ExampleTextDisplayModel.source_resource_id = '123-456-789'
export const R4ExampleText: Story = {
  args: {
    displayModel: r4ExampleTextDisplayModel
  }
};



let r4ExampleXmlDisplayModel =  new BinaryModel(R4ExampleXmlJson, fhirVersions.R4)
r4ExampleXmlDisplayModel.source_id = '123-456-789'
r4ExampleXmlDisplayModel.source_resource_id = '123-456-789'
export const R4ExampleXml: Story = {
  args: {
    displayModel: r4ExampleXmlDisplayModel
  }
};
