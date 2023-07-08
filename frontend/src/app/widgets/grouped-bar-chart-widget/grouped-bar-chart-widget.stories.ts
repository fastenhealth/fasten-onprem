import type { Meta, StoryObj } from '@storybook/angular';
import {GroupedBarChartWidgetComponent} from './grouped-bar-chart-widget.component';
import {applicationConfig, moduleMetadata} from '@storybook/angular';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {importProvidersFrom} from '@angular/core';
import {CommonModule} from '@angular/common';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<GroupedBarChartWidgetComponent> = {
  title: 'Widget/GroupedBarChartWidget',
  component: GroupedBarChartWidgetComponent,
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: HttpClient,
          useClass: HttpClient
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
        importProvidersFrom(HttpClientModule)
      ]
    }),
    moduleMetadata({
      imports: [CommonModule, HttpClientModule],
    })
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

