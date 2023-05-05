import type { Meta, StoryObj } from '@storybook/angular';
import {TableWidgetComponent} from './table-widget.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<TableWidgetComponent> = {
  title: 'Widget/TableWidget',
  component: TableWidgetComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: TableWidgetComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
  },
};

export default meta;
type Story = StoryObj<TableWidgetComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Example: Story = {
  args: {
  }
};

