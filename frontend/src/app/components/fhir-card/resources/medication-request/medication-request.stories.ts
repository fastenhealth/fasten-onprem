import type { Meta, StoryObj } from '@storybook/angular';
import {fhirVersions} from "../../../../../lib/models/constants";
import R4Example1Json from "../../../../../lib/fixtures/r4/resources/medicationRequest/example1.json";
import R4Example2Json from "../../../../../lib/fixtures/r4/resources/medicationRequest/example2.json";
import R4Example3Json from "../../../../../lib/fixtures/r4/resources/medicationRequest/example3.json";
import R4Example4Json from "../../../../../lib/fixtures/r4/resources/medicationRequest/example4.json";
import {MedicationRequestComponent} from "./medication-request.component";
import {MedicationRequestModel} from "../../../../../lib/models/resources/medication-request-model";



// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<MedicationRequestComponent> = {
  title: 'Fhir Card/MedicationRequest',
  component: MedicationRequestComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: MedicationRequestComponent) => ({
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
type Story = StoryObj<MedicationRequestComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
let r4Example1DisplayModel =  new MedicationRequestModel(R4Example1Json, fhirVersions.R4)
r4Example1DisplayModel.source_id = '123-456-789'
r4Example1DisplayModel.source_resource_id = '123-456-789'
export const R4Example1: Story = {
  args: {
    displayModel: r4Example1DisplayModel
  }
};

let r4Example2DisplayModel =  new MedicationRequestModel(R4Example2Json, fhirVersions.R4)
r4Example2DisplayModel.source_id = '123-456-789'
r4Example2DisplayModel.source_resource_id = '123-456-789'
export const R4Example2: Story = {
  args: {
    displayModel: r4Example2DisplayModel
  }
};

let r4Example3DisplayModel =  new MedicationRequestModel(R4Example3Json, fhirVersions.R4)
r4Example3DisplayModel.source_id = '123-456-789'
r4Example3DisplayModel.source_resource_id = '123-456-789'
export const R4Example3: Story = {
  args: {
    displayModel: r4Example3DisplayModel
  }
};


let r4Example4DisplayModel =  new MedicationRequestModel(R4Example4Json, fhirVersions.R4)
r4Example4DisplayModel.source_id = '123-456-789'
r4Example4DisplayModel.source_resource_id = '123-456-789'
export const R4Example4: Story = {
  args: {
    displayModel: r4Example4DisplayModel
  }
};
