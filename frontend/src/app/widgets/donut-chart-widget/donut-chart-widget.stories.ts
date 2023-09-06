import type { Meta, StoryObj } from '@storybook/angular';
import {DonutChartWidgetComponent} from './donut-chart-widget.component';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {CommonModule} from "@angular/common";
import {importProvidersFrom} from "@angular/core";
import {moduleMetadata, applicationConfig} from "@storybook/angular";
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FastenApiService} from '../../services/fasten-api.service';
import {DashboardWidgetQuery} from '../../models/widget/dashboard-widget-query';
import {Observable, of} from 'rxjs';
import { ResponseWrapper } from 'src/app/models/response-wrapper';


class MockFastenApiService implements Partial<FastenApiService> {
  public queryResources(query?: DashboardWidgetQuery): Observable<ResponseWrapper> {
    console.log("CALLED MOCK")
    return of({
      data:{},
      success: true
    })
  }
}



// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<DonutChartWidgetComponent> = {
  title: 'Widget/DonutChartWidget',
  component: DonutChartWidgetComponent,
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
        {
          provide: FastenApiService,
          useClass: MockFastenApiService
        },
        importProvidersFrom(HttpClientTestingModule)
      ]
    }),
    moduleMetadata({
      imports: [CommonModule],
    })
  ],
  tags: ['autodocs'],
  render: (args: DonutChartWidgetComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    widgetConfig: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<DonutChartWidgetComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Example: Story = {
  args: {
    widgetConfig: {
      item_type: 'donut-chart-widget',
      title_text: 'Example',
      description_text: '',
      queries: [],
      width: 1,
      height: 1,
    }
  }
};

