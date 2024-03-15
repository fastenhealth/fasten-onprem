import type { Meta, StoryObj } from '@storybook/angular';
import { fhirVersions } from "../../../../../lib/models/constants";
import { ObservationBarChartComponent } from './observation-bar-chart.component';
import { ObservationModel } from 'src/lib/models/resources/observation-model';
import { observationR4Factory } from 'src/lib/fixtures/factories/r4/resources/observation-r4-factory';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<ObservationBarChartComponent> = {
  title: 'Fhir Card/Common/ObservationBarChart',
  component: ObservationBarChartComponent,
  decorators: [
  ],
  tags: ['autodocs'],
  render: (args: ObservationBarChartComponent) => ({
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
type Story = StoryObj<ObservationBarChartComponent>;

export const NoRange: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.build(), fhirVersions.R4)]
  }
};

export const Range: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.referenceRange().build(), fhirVersions.R4)]
  }
};

export const RangeOnlyLow: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.referenceRangeOnlyLow().build(), fhirVersions.R4)]
  }
};

export const RangeOnlyLowText: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.referenceRangeStringOnlyLow().build(), fhirVersions.R4)]
  }
};

export const RangeOnlyHigh: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.referenceRangeOnlyHigh().build(), fhirVersions.R4)]
  }
};

export const RangeOnlyHighText: Story = {
  args: {
    observations: [new ObservationModel(observationR4Factory.referenceRangeStringOnlyHigh().build(), fhirVersions.R4)]
  }
};
