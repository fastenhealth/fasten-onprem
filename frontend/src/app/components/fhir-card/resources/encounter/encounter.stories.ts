import type { Meta, StoryObj } from '@storybook/angular';
import {EncounterComponent} from "./encounter.component";
import {EncounterModel} from "../../../../../lib/models/resources/encounter-model";
import {fhirVersions} from "../../../../../lib/models/constants";
import R4Example1Json from "../../../../../lib/fixtures/r4/resources/encounter/example1.json";
import R4Example2Json from "../../../../../lib/fixtures/r4/resources/encounter/example2.json";
import R4Example3Json from "../../../../../lib/fixtures/r4/resources/encounter/example3.json";



// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<EncounterComponent> = {
  title: 'Fhir Card/Encounter',
  component: EncounterComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args) => ({
    props: {
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
type Story = StoryObj<EncounterComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
let encounterDisplayModel1 =  new EncounterModel(R4Example1Json, fhirVersions.R4)
encounterDisplayModel1.source_id = '123-456-789'
encounterDisplayModel1.source_resource_id = '123-456-789'
export const R4Example1: Story = {
  args: {
    displayModel: encounterDisplayModel1
  }
};

let encounterDisplayModel2 =  new EncounterModel(R4Example2Json, fhirVersions.R4)
encounterDisplayModel2.source_id = '123-456-789'
encounterDisplayModel2.source_resource_id = '123-456-789'
export const R4Example2: Story = {
  args: {
    displayModel: encounterDisplayModel2
  }
};

let encounterDisplayModel3 =  new EncounterModel(R4Example3Json, fhirVersions.R4)
encounterDisplayModel3.source_id = '123-456-789'
encounterDisplayModel3.source_resource_id = '123-456-789'
export const R4Example3: Story = {
  args: {
    displayModel: encounterDisplayModel3
  }
};
