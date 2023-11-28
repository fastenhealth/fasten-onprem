import type { Meta, StoryObj } from '@storybook/angular';
import {AllergyIntoleranceComponent} from "./allergy-intolerance.component";
import {AllergyIntoleranceModel} from "../../../../../lib/models/resources/allergy-intolerance-model";
import {fhirVersions} from "../../../../../lib/models/constants";
import R4Example1Json from "../../../../../lib/fixtures/r4/resources/allergyIntolerance/example1.json";
import R4Example2Json from "../../../../../lib/fixtures/r4/resources/allergyIntolerance/example2.json";
import R4Example3Json from "../../../../../lib/fixtures/r4/resources/allergyIntolerance/example3.json";



// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<AllergyIntoleranceComponent> = {
  title: 'Fhir/AllergyIntolerance',
  component: AllergyIntoleranceComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: AllergyIntoleranceComponent) => ({
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
type Story = StoryObj<AllergyIntoleranceComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
let aiDisplayModel1 =  new AllergyIntoleranceModel(R4Example1Json, fhirVersions.R4)
aiDisplayModel1.source_id = '123-456-789'
aiDisplayModel1.source_resource_id = '123-456-789'
export const R4Example1: Story = {
  args: {
    displayModel: aiDisplayModel1
  }
};

let aiDisplayModel2 =  new AllergyIntoleranceModel(R4Example2Json, fhirVersions.R4)
aiDisplayModel1.source_id = '123-456-789'
aiDisplayModel1.source_resource_id = '123-456-789'
export const R4Example2: Story = {
  args: {
    displayModel: aiDisplayModel2
  }
};

let aiDisplayModel3 =  new AllergyIntoleranceModel(R4Example3Json, fhirVersions.R4)
aiDisplayModel1.source_id = '123-456-789'
aiDisplayModel1.source_resource_id = '123-456-789'
export const R4Example3: Story = {
  args: {
    displayModel: aiDisplayModel3
  }
};

