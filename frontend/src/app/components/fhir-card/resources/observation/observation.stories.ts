import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { fhirVersions } from "../../../../../lib/models/constants";
import { ObservationComponent } from "./observation.component";
import { ObservationModel } from "../../../../../lib/models/resources/observation-model";
import { RouterTestingModule } from '@angular/router/testing';
import { observationR4Factory } from 'src/lib/fixtures/factories/r4/resources/observation-r4-factory';

const meta: Meta<ObservationComponent> = {
  title: 'Fhir Card/Observation',
  component: ObservationComponent,
  decorators: [
    moduleMetadata({
      imports: [ RouterTestingModule ]
    })
  ],
  tags: ['autodocs'],
  render: (args: ObservationComponent) => ({
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
type Story = StoryObj<ObservationComponent>;

let observation = new ObservationModel(observationR4Factory.referenceRange().build(), fhirVersions.R4);
observation.source_id = '123-456-789'
observation.source_resource_id = '123-456-789'
export const Entry: Story = {
  args: {
    displayModel: observation
  }
};
