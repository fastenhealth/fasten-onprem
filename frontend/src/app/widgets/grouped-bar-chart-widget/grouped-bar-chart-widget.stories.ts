import type { Meta, StoryObj } from '@storybook/angular';
import {GroupedBarChartWidgetComponent} from './grouped-bar-chart-widget.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<GroupedBarChartWidgetComponent> = {
  title: 'Widget/GroupedBarChartWidget',
  component: GroupedBarChartWidgetComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: GroupedBarChartWidgetComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
  },
};

export default meta;
type Story = StoryObj<GroupedBarChartWidgetComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Example: Story = {
  args: {
  }
};

