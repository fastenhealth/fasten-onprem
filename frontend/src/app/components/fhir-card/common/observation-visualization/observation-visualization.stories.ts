import type { Meta, StoryObj } from '@storybook/angular';
import { fhirVersions } from "../../../../../lib/models/constants";
import { ObservationVisualizationComponent } from './observation-visualization.component';
import { ObservationModel } from 'src/lib/models/resources/observation-model';
import { observationR4Factory } from 'src/lib/fixtures/factories/r4/resources/observation-r4-factory';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<ObservationVisualizationComponent> = {
  title: 'Fhir Card/Common/ObservationVisualization',
  component: ObservationVisualizationComponent,
  decorators: [
  ],
  tags: ['autodocs'],
  render: (args: ObservationVisualizationComponent) => ({
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
type Story = StoryObj<ObservationVisualizationComponent>;

export const ValueQuantity: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.valueQuantity().build(), fhirVersions.R4)]
  }
};

export const ValueString: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.valueString().build(), fhirVersions.R4)]
  }
};

export const ValueInteger: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.valueInteger().build(), fhirVersions.R4)]
  }
};

export const ValueCodableConcept: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.valueCodeableConcept().build(), fhirVersions.R4)]
  }
};

export const ValueBoolean: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.valueBoolean().build(), fhirVersions.R4)]
  }
};
