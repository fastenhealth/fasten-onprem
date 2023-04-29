import type { Meta, StoryObj } from '@storybook/angular';
import {LoadingSpinnerComponent} from '../app/components/loading-spinner/loading-spinner.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<LoadingSpinnerComponent> = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinnerComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
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

