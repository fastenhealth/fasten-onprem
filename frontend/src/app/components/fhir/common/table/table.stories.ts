import type { Meta, StoryObj } from '@storybook/angular';
import {TableComponent} from "./table.component";
import {TableRowItem} from "./table-row-item";
import {FastenDisplayModel} from "../../../../../lib/models/fasten/fasten-display-model";

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<TableComponent> = {
  title: 'Fhir/Common/Table',
  component: TableComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: TableComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {

  },
};

export default meta;
type Story = StoryObj<TableComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const String: Story = {
  args: {
    tableData: [
      {
        enabled: true,
        label: 'hello',
        data: 'world'
      },
      {
        enabled: true,
        label: 'hello',
        data: 'world'
      },
      {
        enabled: true,
        label: 'hello',
        data: 'world'
      },
    ],
  }
};

export const Ref: Story = {
  args: {
    displayModel: {
      source_id: '123-456-789',
    } as FastenDisplayModel,
    tableData: [
      {
        enabled: true,
        label: 'hello',
        data_type: 'reference',
        data: {
          reference: 'Patient/123',
          display: 'John Doe'
        }
      },
      {
        enabled: true,
        label: 'hello',
        data_type: 'reference',
        data: {
          reference: 'Patient/123',
          display: 'John Doe'
        }
      },
      {
        enabled: true,
        label: 'hello',
        data_type: 'reference',
        data: {
          reference: 'Patient/123',
          display: 'John Doe'
        }
      }
    ] as TableRowItem[]
  },
};

