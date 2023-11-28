import type { Meta, StoryObj } from '@storybook/angular';
import {fhirVersions} from "../../../../../lib/models/constants";
import R4Example1Json from "../../../../../lib/fixtures/r4/resources/binary/exampleDicom.json";
import {BinaryModel} from "../../../../../lib/models/resources/binary-model";
import {DicomComponent} from "./dicom.component";

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<DicomComponent> = {
  title: 'Fhir/Datatypes/Dicom',
  component: DicomComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: DicomComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    displayModel: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<DicomComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
let aiDisplayModel1 =  new BinaryModel(R4Example1Json, fhirVersions.R4)
aiDisplayModel1.source_id = '123-456-789'
aiDisplayModel1.source_resource_id = '123-456-789'
export const R4Example1: Story = {
  args: {
    displayModel: aiDisplayModel1
  }
};

