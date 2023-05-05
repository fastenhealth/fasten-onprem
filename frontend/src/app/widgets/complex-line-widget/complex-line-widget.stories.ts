import type { Meta, StoryObj } from '@storybook/angular';
import {ComplexLineWidgetComponent} from "./complex-line-widget.component";

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<ComplexLineWidgetComponent> = {
  title: 'Widget/ComplexLineWidget',
  component: ComplexLineWidgetComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: ComplexLineWidgetComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
  },
};

export default meta;
type Story = StoryObj<ComplexLineWidgetComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Example: Story = {
  args: {
  }
};

