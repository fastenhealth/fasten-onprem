import type { Meta, StoryObj } from '@storybook/angular';
import {LoadingSpinnerComponent} from '../app/components/status/loading-spinner/loading-spinner.component';
import {StatusModule} from '../app/components/status/status.module';
import {applicationConfig, moduleMetadata} from '@storybook/angular';
import {importProvidersFrom} from '@angular/core';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<LoadingSpinnerComponent> = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinnerComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [StatusModule]
    // })
    applicationConfig({
      providers: [importProvidersFrom(StatusModule)],
    }),
  ],
  tags: ['autodocs'],
  render: (args: LoadingSpinnerComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    loadingTitle: {
      control: 'text',
    },
    loadingSubTitle: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<LoadingSpinnerComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    loadingTitle: "Custom loading title",
  },
};

