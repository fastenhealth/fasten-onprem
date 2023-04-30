import type { Meta, StoryObj } from '@storybook/angular';
import {FhirResourceComponent} from '../../app/components/fhir/fhir-resource/fhir-resource.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<FhirResourceComponent> = {
  title: 'Fhir/FhirResource',
  component: FhirResourceComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: FhirResourceComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    // loadingTitle: {
    //   control: 'text',
    // },
    // loadingSubTitle: {
    //   control: 'text',
    // },
  },
};

export default meta;
type Story = StoryObj<FhirResourceComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Primary: Story = {};

export const Secondary: Story = {
  args: {
  },
};

