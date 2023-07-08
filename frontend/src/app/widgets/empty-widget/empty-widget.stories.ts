import type { Meta, StoryObj } from '@storybook/angular';
import {EmptyWidgetComponent} from './empty-widget.component';
import {applicationConfig, moduleMetadata} from '@storybook/angular';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {importProvidersFrom} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterTestingModule} from '@angular/router/testing';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<EmptyWidgetComponent> = {
  title: 'Widget/EmptyWidget',
  component: EmptyWidgetComponent,
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
      imports: [CommonModule, HttpClientModule, RouterTestingModule],
    })
  ],
  tags: ['autodocs'],
  render: (args: EmptyWidgetComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
  },
};

export default meta;
type Story = StoryObj<EmptyWidgetComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Example: Story = {
  args: {
  }
};

