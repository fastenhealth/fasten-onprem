import type { Meta, StoryObj } from '@storybook/angular';
import { fhirVersions } from "../../../../../lib/models/constants";
import { ObservationTableComponent } from './observation-table.component';
import { ObservationModel } from 'src/lib/models/resources/observation-model';
import { observationR4Factory } from 'src/lib/fixtures/factories/r4/resources/observation-r4-factory';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<ObservationTableComponent> = {
  title: 'Fhir Card/Common/ObservationTable',
  component: ObservationTableComponent,
  decorators: [
  ],
  tags: ['autodocs'],
  render: (args: ObservationTableComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    observations: {
      control: 'object',
    }
  },
};

export default meta;
type Story = StoryObj<ObservationTableComponent>;

export const ValueQuantity: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.valueQuantity().build(), fhirVersions.R4)]
  }
};

export const ValueStringWithRange: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.valueString().referenceRange().build(), fhirVersions.R4)]
  }
};

export const ValueCodableConcept: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.valueCodeableConcept().build(), fhirVersions.R4)]
  }
};
